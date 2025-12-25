import getStars from './getStars';
import getProfile from './getProfile';

import { IUser } from '../../models/User';
import getCurrentTimestamp from '../../utils/getCurrentTimestamp';

const DEFAULT_FRESHNESS_THRESHOLD_SECONDS = 86400;

function getUpdatedAtAsSeconds(updatedAt: number | string | undefined): number | null {
  if (updatedAt === undefined || updatedAt === null) {
    return null;
  }

  if (typeof updatedAt === 'number') {
    return updatedAt < 1e12 ? updatedAt : Math.floor(updatedAt / 1000);
  }

  if (typeof updatedAt === 'string') {
    const parsed = Date.parse(updatedAt);
    if (Number.isFinite(parsed)) {
      return Math.floor(parsed / 1000);
    }
  }

  return null;
}

function getFreshnessThreshold(): number {
  const thresholdEnv = process.env.SKIP_IF_UPDATED_WITHIN_SECONDS;
  if (thresholdEnv === undefined || thresholdEnv === '') {
    return DEFAULT_FRESHNESS_THRESHOLD_SECONDS;
  }
  const parsed = parseInt(thresholdEnv, 10);
  return Number.isFinite(parsed) && parsed > 0 ? parsed : DEFAULT_FRESHNESS_THRESHOLD_SECONDS;
}

function shouldSkipUser(existingUser: IUser | null | undefined): boolean {
  if (process.env.FORCE_UPDATE === '1') {
    return false;
  }

  if (!existingUser) {
    return false;
  }

  const updatedAtSeconds = getUpdatedAtAsSeconds(existingUser.updatedAt);
  if (updatedAtSeconds === null || updatedAtSeconds <= 0) {
    return false;
  }

  const now = getCurrentTimestamp();
  const ageSeconds = now - updatedAtSeconds;

  if (ageSeconds < 0) {
    return false;
  }

  return ageSeconds < getFreshnessThreshold();
}

export default async function parser(
  userID: string,
  existingUser?: IUser | null
): Promise<IUser | null> {
  if (shouldSkipUser(existingUser)) {
    const updatedAtSeconds = getUpdatedAtAsSeconds(existingUser!.updatedAt);
    const now = getCurrentTimestamp();
    const ageSeconds = now - (updatedAtSeconds ?? 0);
    console.log(`[parseUser] Skipping ${userID}: updated ${ageSeconds}s ago (threshold: ${getFreshnessThreshold()}s)`);
    return null;
  }

  const userInformation: Partial<IUser> = await getProfile(userID);
  if (!userInformation.bio) {
    userInformation.bio = '결과 없음';
  }
  userInformation.stars = await getStars(userID);
  userInformation.updatedAt = getCurrentTimestamp();
  return userInformation as IUser;
}
