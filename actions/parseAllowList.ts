import readFileAsync from '../utils/readFileAsync';
import getTrimmedLinesFromText from '../utils/getTrimmedLinesFromText';

export default async function parseAllowList(): Promise<string[]> {
  const allowList = getTrimmedLinesFromText(
    (await readFileAsync(`${__dirname}/../ALLOWLIST`))
    .toString());

  const seen = new Set<string>();
  const uniqueAllowList = allowList.filter((id) => {
    const lowerId = id.toLowerCase();
    if (seen.has(lowerId)) return false;
    seen.add(lowerId);
    return true;
  });

  const uniqueSortedList = uniqueAllowList.sort((a, b) =>
    a.toLowerCase().localeCompare(b.toLowerCase())
  );

  console.log(uniqueSortedList);
  return uniqueSortedList;
}
