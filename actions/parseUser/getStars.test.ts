import getStars from './getStars';
import { SECONDS } from '../../utils/constants';

describe('Get stars', () => {
  test('Get stars from userID', async () => {
    const stars: number = await getStars('junhoyeo');
    expect(stars).toBeGreaterThan(300);
  }, 30 * SECONDS);
});
