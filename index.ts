import parseAllowList from './actions/parseAllowList';
import parseUser from './actions/parseUser';
import getRankedUsers from './actions/getRankedUsers';
import renderHTMLFromRanked from './actions/renderHTMLFromRanked';
import deployToGitHubPages from './actions/deployToGitHubPages';

import commitDatabase from './database/commitDatabase';
import getAllUsers from './database/getAllUsers';
import updateUser from './database/updateUser';

import { SECONDS } from './utils/constants';
import delayForMilliseconds from './utils/delayForMilliseconds';
import writeFileAsync from './utils/writeFileAsync';

async function updateDatabaseFromAllowList(): Promise<void> {
  const allowList = await parseAllowList();
  iterateUsers:
    for (const userID of allowList) {
      let isErrorResolved = false;
      let errorCount = 0;
      while (!isErrorResolved) {
        if (errorCount > 3) {
          break;
        }
        try {
          const user = await parseUser(userID);
          updateUser(user);
          await delayForMilliseconds(3 * SECONDS);
          console.log(`✅ Updated user "${user.name}"`);
          isErrorResolved = true;
        } catch (error) {
          if (error.response?.statusCode === 429) {
            break iterateUsers;
          }
          console.error(error, error.stack);
          errorCount ++;
        }
      }
    }
}

async function main(): Promise<void> {
  await updateDatabaseFromAllowList();

  const users = getAllUsers();
  const rankedUsers = await getRankedUsers(users);
  console.log('🏆 Ranked users!');
  await commitDatabase();

  const renderedHTML = await renderHTMLFromRanked(rankedUsers);
  await writeFileAsync('./public/build/index.html', renderedHTML);
  await deployToGitHubPages();
}

main();
