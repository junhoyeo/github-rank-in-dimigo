import axios from 'axios';
import cheerio from 'cheerio';

import getSumOfNumberArray from '../../utils/getSumOfNumberArray';
import { getTotalStarsForUser, hasGitHubToken, getGitHubToken } from '../../utils/githubGraphQL';

function parseStarCountText(text: string): number {
  const normalized = text.replace(/,+/g, '').trim().toLowerCase();
  const match = normalized.match(/^([\d.]+)([km])?$/);
  if (!match) {
    return Number(normalized) || 0;
  }
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) {
    return 0;
  }
  if (match[2] === 'k') {
    return Math.round(value * 1000);
  }
  if (match[2] === 'm') {
    return Math.round(value * 1000000);
  }
  return value;
}

async function _countStarsFromURL(url: string): Promise<number> {
  const { data: html } = await axios.get(url);
  const document = cheerio.load(html);
  const starCounts = document('a[href*="stargazers"]')
    .toArray()
    .flatMap((anchorReference) => {
      const anchor = cheerio(anchorReference);
      const href = anchor.attr('href');
      if (href && href.includes('stargazers')) {
        return [
          parseStarCountText(anchor.text())
        ];
      }
      return [];
    });
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
      return await getTotalStarsForUser(token, userID);
    } catch (error) {
      console.warn(`[getStars] GraphQL failed for ${userID}, falling back to web scraping:`, error);
    }
  }

  return await _countStarsFromURL(`https://github.com/${userID}?tab=repositories`);
}
