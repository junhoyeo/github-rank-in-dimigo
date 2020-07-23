import parseUser from './parseUser';
import { IUser } from '../models/User';
import { SECONDS } from '../utils/constants';

describe('Parse user information', () => {
  test('Parse user information from userID', async () => {
    const user: IUser = await parseUser('junhoyeo');
    expect(user.id).toEqual('junhoyeo');
    expect(user).toEqual(expect.objectContaining<IUser>({
      id: expect.any(String),
      name: expect.any(String),
      bio: expect.any(String),
      avatarURL: expect.any(String),
      followers: expect.any(Number),
      publicRepos: expect.any(Number),
      stars: expect.any(Number),
      updatedAt: expect.any(Number),
    }));
  }, 30 * SECONDS);
});
