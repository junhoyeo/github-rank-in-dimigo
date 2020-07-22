export interface IUserProfile {
  id: string;
  name: string;
  avatarURL: string;
  bio: string | null;
  followers: number;
  publicRepos: number;
}
