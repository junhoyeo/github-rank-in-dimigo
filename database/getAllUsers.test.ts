import getAllUsers from './getAllUsers';

describe('Get all users from database', () => {
  test('Query all users', () => {
    const users = getAllUsers();
    expect(users).toEqual([]);
  });
});
