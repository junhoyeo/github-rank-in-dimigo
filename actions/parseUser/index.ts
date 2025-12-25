import axios from 'axios';
import getStars from './getStars';
import getProfile from './getProfile';

import { IUser } from '../../models/User';
import getCurrentTimestamp from '../../utils/getCurrentTimestamp';

const DEFAULT_FRESHNESS_THRESHOLD_SECONDS = 86400;

function is404Error(error: unknown): boolean {
  if (axios.isAxiosError(error)) {
    return error.response?.status === 404;
  }
  if (typeof error === 'object' && error !== null) {
    const e = error as { status?: number; response?: { status?: number } };
    return (e.response?.status ?? e.status) === 404;
  }
  return false;
}

function handleProfileNotFound(
  userID: string,
  existingUser: IUser | null | undefined
): IUser {
  const currentFailures = existingUser?.consecutiveFailures ?? 0;
  const newFailures = currentFailures + 1;
  const now = getCurrentTimestamp();

  const newStatus: 'suspected_missing' | 'confirmed_missing' =
    newFailures >= 3 ? 'confirmed_missing' : 'suspected_missing';

  console.log(
    `[parseUser] 404 for ${userID}: consecutiveFailures ${currentFailures} → ${newFailures}, status → ${newStatus}`
  );

  if (existingUser) {
    return {
      ...existingUser,
      status: newStatus,
      consecutiveFailures: newFailures,
      updatedAt: now,
    };
  }

  return {
    id: userID,
    name: userID,
    avatarURL: '',
    bio: null,
    followers: 0,
    publicRepos: 0,
    stars: 0,
    status: newStatus,
    consecutiveFailures: newFailures,
    updatedAt: now,
  };
}

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

  // Bypass freshness check for suspected_missing users so they get confirmed faster
  if (existingUser.status === 'suspected_missing') {
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

  try {
    const userInformation: Partial<IUser> = await getProfile(userID);
    if (!userInformation.bio) {
      userInformation.bio = '결과 없음';
    }
    userInformation.stars = await getStars(userID);
    userInformation.updatedAt = getCurrentTimestamp();
    return userInformation as IUser;
  } catch (error) {
    if (is404Error(error)) {
      return handleProfileNotFound(userID, existingUser);
    }
    throw error;
  }
}
