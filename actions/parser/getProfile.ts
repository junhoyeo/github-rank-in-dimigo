import axios from 'axios';
import cheerio from 'cheerio';

import { IUserProfile } from '../../models/User';

const removeLinebreaksFromBio = (bioText: string): string => {
  return bioText
    .split('\n')
    .filter(isNotEmpty => isNotEmpty)
    .join(' ');
};

export default async function getProfile(userID: string): Promise<IUserProfile> {
  const { data: html } = await axios.get(`https://github.com/${userID}`);
  const document = cheerio.load(html);

  const findTextFromSelector = (selector: string): string =>
    document(selector).first().text().trim();

  const name = findTextFromSelector('span.vcard-fullname');

  const parsedBio = findTextFromSelector('div.user-profile-bio > div');
  const bio = removeLinebreaksFromBio(parsedBio);

  const followers = Number(findTextFromSelector('svg.octicon-people + span'));
  const publicRepos = Number(findTextFromSelector('svg.octicon-repo + span'));
  const avatarURL = document('img.avatar-user').first().attr('src') as string;

  const userProfile: IUserProfile = {
    id: userID,
    name: name || userID,
    bio,
    avatarURL,
    followers,
    publicRepos,
  };
  return userProfile;
}
