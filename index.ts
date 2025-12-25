import parseAllowList from "./actions/parseAllowList";
import parseUser from "./actions/parseUser";
import getRankedUsers from "./actions/getRankedUsers";
import renderHTMLFromRanked from "./actions/renderHTMLFromRanked";

import getAllUsers from "./database/getAllUsers";
import getUserByID from "./database/getUserByID";
import updateUser from "./database/updateUser";

import { runWithConcurrencyLimit } from "./utils/concurrency";
import writeFileAsync from "./utils/writeFileAsync";

function getConcurrency(): number {
  const envValue = process.env.CONCURRENCY;
  if (envValue === undefined || envValue.trim() === '') {
    return 5;
  }
  const parsed = parseInt(envValue.trim(), 10);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return 5;
  }
  // Clamp to reasonable range (1-20)
  return Math.min(Math.max(parsed, 1), 20);
}

function getUpdatedAtSeconds(updatedAt: number | string | undefined): number {
  if (updatedAt === undefined || updatedAt === null) {
    return 0;
  }
  if (typeof updatedAt === 'number') {
    // Heuristic: < 1e12 is seconds, >= 1e12 is milliseconds
    return updatedAt < 1e12 ? updatedAt : Math.floor(updatedAt / 1000);
  }
  if (typeof updatedAt === 'string') {
    const parsed = Date.parse(updatedAt);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }
  return 0;
}

async function updateDatabaseFromAllowList(): Promise<void> {
  const allowList = await parseAllowList();
  const concurrency = getConcurrency();
  console.log(`🔄 Processing ${allowList.length} users with concurrency ${concurrency}`);

  const usersWithSortKey = allowList.map((userID) => {
    const existingUser = getUserByID(userID);
    const sortKey = getUpdatedAtSeconds(existingUser?.updatedAt);
    return { userID, existingUser, sortKey };
  });

  usersWithSortKey.sort((a, b) => a.sortKey - b.sortKey);

  let successCount = 0;
  let skipCount = 0;
  let errorCount = 0;

  await runWithConcurrencyLimit(usersWithSortKey, concurrency, async ({ userID, existingUser }) => {
    try {
      const user = await parseUser(userID, existingUser);
      if (user) {
        updateUser(user);
        console.log(`✅ Updated user "${user.id}"`);
        successCount++;
      } else {
        skipCount++;
      }
    } catch (error) {
      console.error(`❌ Error processing ${userID}:`, error);
      errorCount++;
    }
  });

  console.log(`📊 Summary: ${successCount} updated, ${skipCount} skipped, ${errorCount} errors`);
}

async function main(): Promise<void> {
  await updateDatabaseFromAllowList();

  const users = getAllUsers();
  const rankedUsers = await getRankedUsers(users);
  console.log("🏆 Ranked users!");

  const renderedHTML = await renderHTMLFromRanked(rankedUsers);
  await writeFileAsync("./public/build/index.html", renderedHTML);
}

main();
