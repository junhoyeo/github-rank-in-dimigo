import getProfile from './getProfile';
import { IUserProfile } from '../../models/User';
import { SECONDS } from '../../utils/constants';

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

  test('Get complicated bio without line breaks', async () => {
    const information: IUserProfile = await getProfile('cokia');
    expect(information.bio).toEqual('Student in Korea Digital Media High school Web-programming Department. interested in Hardware, Digital Forensic, Blockchain, Server programming😀');
  }, 30 * SECONDS);

  test('Get empty bio as null', async () => {
    const information: IUserProfile = await getProfile('uhmseohun');
    expect(information.bio).toEqual(null);
  }, 30 * SECONDS);
});
