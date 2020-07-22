import axios from 'axios';
import cheerio from 'cheerio';

function getSumOfArray(arrayOfNumbers: number[]): number {
  return arrayOfNumbers.reduce((a, b) => a + b, 0);
}

async function _countStarsFromURL(url: string): Promise<number> {
  const { data: html } = await axios.get(url);
  const document = cheerio.load(html);
  const starCounts = document('a.muted-link.mr-3')
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
  const currentCounts = getSumOfArray(starCounts);

  const nextButton = document('a.btn.btn-outline.BtnGroup-item:last-child').first();
  if (nextButton?.text().includes('Next')) {
    const nextURL = nextButton.attr('href');
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
