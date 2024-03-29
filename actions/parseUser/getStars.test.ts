import getStars from './getStars';
import { SECONDS } from '../../utils/constants';

describe('Get stars', () => {
  test('Get stars from userID', async () => {
    const stars: number = await getStars('junhoyeo');
    expect(stars).toBeGreaterThan(1_000);
  }, 30 * SECONDS);
});
