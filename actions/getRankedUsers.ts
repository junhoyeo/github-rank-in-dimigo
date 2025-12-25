import moment from 'moment';

import { IUser, IRankedUser } from '../models/User';

export default async function getRankedUsers(users: IUser[]): Promise<IRankedUser[]> {
  const activeUsers = users.filter(user => user.status !== 'confirmed_missing');

  activeUsers.sort(
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
  return activeUsers.flatMap((user) => {
    const {
      stars: currentUserStars,
      updatedAt: currentUserLastUpdated,
    } = user;
    if (currentUserStars < 1) {
      return [];
    }

    if (currentUserStars != previousStars) {
      currentRank ++;
    }
    previousStars = currentUserStars;

    const formattedUpdatedAt = moment
      .unix(currentUserLastUpdated as number)
      .format('YYYY-MM-DD HH:mm:ss');

    return [{
      ...user,
      rank: currentRank,
      updatedAt: formattedUpdatedAt,
    }];
  }) as IRankedUser[];
}
