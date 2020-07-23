import getRankedUsers from './getRankedUsers';
import { IUser, IRankedUser } from '../models/User';

describe('Rank users', () => {
  test('Rank users from provided array', async () => {
    const users: IUser[] = [
      {
        id: 'uhmseohun',
        name: 'Seohun Uhm',
        bio: '결과 없음',
        avatarURL: 'https://avatars0.githubusercontent.com/u/16954420?s=88&u=9d474b731aee27b2e80ace2305b17cf90fe10a93&v=4',
        followers: 34,
        publicRepos: 25,
        stars: 34,
        updatedAt: 1595481051
      },
      {
        id: 'junhoyeo',
        name: 'Junho Yeo',
        bio: 'Creating INEVITABLE™ Frontend',
        avatarURL: 'https://avatars3.githubusercontent.com/u/32605822?s=88&u=96ba32582d1568c561c6685bebaabe0164df19d9&v=4',
        followers: 221,
        publicRepos: 137,
        stars: 370,
        updatedAt: 1595480727
      },
    ];
    const rankedUsers: IRankedUser[] = await getRankedUsers(users);

    const [firstUser, secondUser] = rankedUsers;
    expect(firstUser.rank).toEqual(1);
    expect(firstUser.rank <= secondUser.rank).toBe(true);
    expect(firstUser.stars >= secondUser.stars).toEqual(true);
  });
});
