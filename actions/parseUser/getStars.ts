import axios from 'axios';
import cheerio from 'cheerio';

import getSumOfNumberArray from '../../utils/getSumOfNumberArray';

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
  return await _countStarsFromURL(`https://github.com/${userID}?tab=repositories`);
}
