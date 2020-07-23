import fs from 'fs';
import util from 'util';

const readFileAsync = util.promisify(fs.readFile);

export default readFileAsync;
