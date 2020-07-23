import fs from 'fs';
import util from 'util';

import getTrimmedLinesFromText from '../utils/getTrimmedLinesFromText';

const readFileAsync = util.promisify(fs.readFile);

export default async function parseAllowList(): Promise<string[]> {
  const allowList = getTrimmedLinesFromText(
    (await readFileAsync(`${__dirname}/../ALLOWLIST`))
    .toString());
  console.log(allowList);
  return allowList;
}
