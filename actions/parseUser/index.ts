import getStars from './getStars';
import getProfile from './getProfile';

import { IUser } from '../../models/User';

const getCurrentTimestamp = () => ~~(Date.now() / 1000);

export default async function parser(userID: string) {
  const userInformation: Partial<IUser> = await getProfile(userID);
  if (!userInformation.bio) {
    userInformation.bio = '결과 없음';
  }
  userInformation.stars = await getStars(userID);
  userInformation.updatedAt = getCurrentTimestamp();
  return userInformation as Required<IUser>;
}
