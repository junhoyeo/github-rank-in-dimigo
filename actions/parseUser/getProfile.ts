import axios from 'axios';
import cheerio from 'cheerio';

import getNumbersFromAPI from './getNumbersFromAPI';
import { IUserProfile } from '../../models/User';
import removeLinebreaksFromText from '../../utils/removeLinebreaksFromText';

export default async function getProfile(userID: string): Promise<IUserProfile> {
  const { data: html } = await axios.get(`https://github.com/${userID}`);
  const document = cheerio.load(html);

  const findTextFromSelector = (selector: string): string =>
    document(selector).first().text().trim();

  const name = findTextFromSelector('span.vcard-fullname');

  const parsedBio = findTextFromSelector('div.user-profile-bio > div');
  const bio = removeLinebreaksFromText(parsedBio) || null;

  const followersAsText = findTextFromSelector('svg.octicon-people + span');
  const publicReposAsText = findTextFromSelector('svg.octicon-repo + span');

  const [followers, publicRepos] = await (async () => {
    const isFollowersMoreThanThousand = followersAsText.includes('k');
    const isPublicReposMoreThanThousand = publicReposAsText.includes('k');
    if (isFollowersMoreThanThousand || isPublicReposMoreThanThousand) {
      const { followers, publicRepos } = await getNumbersFromAPI(userID);
      return [followers, publicRepos];
    }
    return [
      Number(followersAsText),
      Number(publicReposAsText),
    ];
  })();

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
