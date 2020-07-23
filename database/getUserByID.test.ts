import getUserByID from './getUserByID';

describe('Get User document from id', () => {
  test('Return null if user does not exist', () => {
    const user = getUserByID('some-id-that-never-will-exist-on-db');
    expect(user).toEqual(null);
  });
});
