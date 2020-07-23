import getNumbersFromAPI from './getNumbersFromAPI';

describe('Get user followers & number of public repositories', () => {
  test('Get user followers from Official GitHub API', async () => {
    const { followers } = await getNumbersFromAPI('junhoyeo');
    expect(followers).toBeGreaterThan(200);
  });

  test('Get count of public repos from Official GitHub API', async () => {
    const { publicRepos } = await getNumbersFromAPI('junhoyeo');
    expect(publicRepos).toBeGreaterThan(100);
  });
});
