import parseAllowlist from './parseAllowList';
import { SECONDS } from '../utils/constants';

describe('Parse ALLOWLIST from file', () => {
  test('Parse lines from ALLOWLIST', async () => {
    const lines: string[] = await parseAllowlist();
    expect(Array.isArray(lines));
  }, 30 * SECONDS);
});
