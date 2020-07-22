import getProfile from './getProfile';
import { IUserProfile } from '../../models/User';

const SECONDS = 1000;

describe('Get user profile', () => {
  test('Get user information from GitHub profile', async () => {
    const information: IUserProfile = await getProfile('junhoyeo');

    expect(information.id).toEqual('junhoyeo');
    expect(information.name).toEqual('Junho Yeo');
    expect(information.bio).toEqual('Creating INEVITABLE™ Frontend');

    expect(information).toHaveProperty('avatarURL');
    expect(information).toHaveProperty('followers');
    expect(information).toHaveProperty('publicRepos');
  }, 30 * SECONDS);
});
