import axios from 'axios';
import cheerio from 'cheerio';

import { IUserProfile } from '../../models/User';
import removeLinebreaksFromText from '../../utils/removeLinebreaksFromText';

function parseCountText(text: string): number {
  const normalized = text.replace(/,+/g, '').trim().toLowerCase();
  const match = normalized.match(/^([\d.]+)([km])?$/);
  if (!match) {
    const fallback = Number(normalized);
    return Number.isFinite(fallback) ? fallback : NaN;
  }
  const value = parseFloat(match[1]);
  if (!Number.isFinite(value)) {
    return NaN;
  }
  if (match[2] === 'k') {
    return Math.round(value * 1000);
  }
  if (match[2] === 'm') {
    return Math.round(value * 1000000);
  }
  return value;
}

export default async function getProfile(userID: string): Promise<IUserProfile> {
  const { data: html } = await axios.get(`https://github.com/${userID}`);
  const document = cheerio.load(html);

  const findTextFromSelector = (selector: string): string =>
    document(selector).first().text().trim();

  const name =
    findTextFromSelector('span.vcard-fullname') ||
    findTextFromSelector('[itemprop="name"]') ||
    '';

  const bioElement = document('div.user-profile-bio').first();
  const parsedBio =
    bioElement.find('div').first().text().trim() ||
    (bioElement.attr('data-bio-text') || '').trim() ||
    bioElement.text().trim();
  const bio = removeLinebreaksFromText(parsedBio) || null;

  const followersAnchor = document('a[href*="tab=followers"]').first();
  const followersAsText =
    followersAnchor.find('span').first().text().trim() ||
    findTextFromSelector('svg.octicon-people + span');

  const reposAnchor = document('a[data-tab-item="repositories"]').first();
  const reposCounter = reposAnchor.find('.Counter').first();
  const reposCounterTitle = reposCounter.attr('title');
  const publicReposAsText =
    (reposCounterTitle && reposCounterTitle.trim()) ||
    reposCounter.text().trim() ||
    findTextFromSelector('a[href*="tab=repositories"] .Counter') ||
    findTextFromSelector('svg.octicon-repo + span');

  const followers = parseCountText(followersAsText);
  const publicRepos = parseCountText(publicReposAsText);

  const avatarURL =
    document('img.avatar-user').first().attr('src') ||
    document('img.avatar').first().attr('src') ||
    '';

  const userProfile: IUserProfile = {
    id: userID,
    name: name || userID,
    bio,
    avatarURL,
    followers,
    publicRepos,
  };
  return userProfile;
}
