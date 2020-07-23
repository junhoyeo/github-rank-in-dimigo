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
}

export interface IRankedUser extends Required<IUser> {
  rank: number;
  updatedAt: string;
}
