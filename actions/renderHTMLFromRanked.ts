import ejs from 'ejs';

import { IUser } from '../models/User';
import readFileAsync from '../utils/readFileAsync';

export default async function renderHTMLFromRanked(rankedUsers: IUser[]): Promise<string> {
  const template = (await readFileAsync('./public/build/template.ejs')).toString();
  const html = ejs.render(template, { rankedUsers });
  return html;
}
