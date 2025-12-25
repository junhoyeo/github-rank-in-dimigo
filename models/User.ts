export interface IUserProfile {
  id: string;
  name: string;
  avatarURL: string;
  bio: string | null;
  followers: number;
  publicRepos: number;
}

export interface IUser extends IUserProfile {
  stars: number;
  updatedAt: number | string;
  status?: 'active' | 'suspected_missing' | 'confirmed_missing';
  consecutiveFailures?: number;
  lastSuccessfulUpdateAt?: number;
}

export interface IRankedUser extends Required<IUser> {
  rank: number;
  updatedAt: string;
}
