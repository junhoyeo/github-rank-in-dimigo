import getStars from './getStars';

const SECONDS = 1000;

describe('Get stars', () => {
  test('Get stars from userID', async () => {
    const stars: number = await getStars('junhoyeo');
    expect(stars).toBeGreaterThan(300);
  }, 30 * SECONDS);
});
