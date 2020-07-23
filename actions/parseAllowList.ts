import readFileAsync from '../utils/readFileAsync';
import getTrimmedLinesFromText from '../utils/getTrimmedLinesFromText';

export default async function parseAllowList(): Promise<string[]> {
  const allowList = getTrimmedLinesFromText(
    (await readFileAsync(`${__dirname}/../ALLOWLIST`))
    .toString());
  console.log(allowList);
  return allowList;
}
