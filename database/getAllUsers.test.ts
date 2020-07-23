import getAllUsers from './getAllUsers';
import { IUser } from '../models/User';

describe('Get all users from database', () => {
  test('Query all users', () => {
    const users: IUser[] = getAllUsers();
    expect(Array.isArray(users));
  });
});
