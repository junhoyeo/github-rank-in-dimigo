import moment from 'moment';

import { IUser, IRankedUser } from '../models/User';

export default async function getRankedUsers(users: IUser[]): Promise<IRankedUser[]> {
  users.sort(
    function(firstUser, secondUser) {
      if (firstUser.stars === secondUser.stars) {
        if (firstUser.followers === secondUser.followers) {
          return secondUser.publicRepos - firstUser.publicRepos;
        }
        return secondUser.followers - firstUser.followers;
      }
      return secondUser.stars - firstUser.stars;
  });

  let currentRank = 0
  let previousStars = 0
  return users.flatMap((user) => {
    const {
      stars: currentUserStars,
      updatedAt: currentUserLastUpdated,
    } = user;
    if (currentUserStars < 0) {
      return [];
    }

    if (currentUserStars != previousStars) {
      currentRank ++;
    }
    (user as IRankedUser).rank = currentRank;
    previousStars = currentUserStars;

    user.updatedAt = moment
      .unix(currentUserLastUpdated as number)
      .format('YYYY-MM-DD hh:mm:ss');
    console.log(user);
    return [user];
  }) as IRankedUser[];
}
