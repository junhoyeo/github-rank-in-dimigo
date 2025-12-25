import readFileAsync from '../utils/readFileAsync';
import getTrimmedLinesFromText from '../utils/getTrimmedLinesFromText';

export default async function parseAllowList(): Promise<string[]> {
  const allowList = getTrimmedLinesFromText(
    (await readFileAsync(`${__dirname}/../ALLOWLIST`))
    .toString());

  const uniqueSortedList = Array.from(new Set(allowList)).sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  console.log(uniqueSortedList);
  return uniqueSortedList;
}
