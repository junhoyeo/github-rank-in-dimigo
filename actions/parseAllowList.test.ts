import parseAllowList from './parseAllowList';
import { SECONDS } from '../utils/constants';

describe('Parse ALLOWLIST from file', () => {
  test('Parse lines from ALLOWLIST', async () => {
    const lines: string[] = await parseAllowList();
    expect(Array.isArray(lines));
  }, 30 * SECONDS);
});
