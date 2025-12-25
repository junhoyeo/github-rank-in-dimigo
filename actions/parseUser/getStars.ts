import axios from 'axios';
import cheerio from 'cheerio';

import getSumOfNumberArray from '../../utils/getSumOfNumberArray';
import { getTotalStarsForUser, hasGitHubToken, getGitHubToken } from '../../utils/githubGraphQL';

async function _countStarsFromURL(url: string): Promise<number> {
  const { data: html } = await axios.get(url);
  const document = cheerio.load(html);
  const starCounts = document('a.Link--muted.mr-3')
    .toArray()
    .flatMap((anchorReference) => {
      const anchor = cheerio(anchorReference);
      const href = anchor.attr('href');
      if (href && href.includes('stargazers')) {
        return [
          Number(anchor.text().replace(/,+/g, '').trim())
        ];
      }
      return [];
    });
  console.log(starCounts);
  const currentCounts = getSumOfNumberArray(starCounts);

  const nextButton = document('a.next_page').first();
  if (nextButton?.text().includes('Next')) {
    let nextURL = nextButton.attr('href') ?? '';
    if (!nextURL?.startsWith('http')) {
      nextURL = `https://github.com` + nextURL
    }
    if (nextURL) {
      const nextCounts = await _countStarsFromURL(nextURL);
      return currentCounts + nextCounts;
    }
  }
  return currentCounts;
}

export default async function getStars(userID: string): Promise<number> {
  if (hasGitHubToken()) {
    try {
      const token = getGitHubToken();
      console.log(`[getStars] Using GraphQL API for ${userID}`);
      return await getTotalStarsForUser(token, userID);
    } catch (error) {
      console.warn(`[getStars] GraphQL failed for ${userID}, falling back to web scraping:`, error);
    }
  } else {
    console.log(`[getStars] No GITHUB_TOKEN, using web scraping for ${userID}`);
  }

  return await _countStarsFromURL(`https://github.com/${userID}?tab=repositories`);
}
