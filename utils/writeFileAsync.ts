import fs from 'fs';
import util from 'util';

const writeFileAsync = util.promisify(fs.writeFile);

export default writeFileAsync;
