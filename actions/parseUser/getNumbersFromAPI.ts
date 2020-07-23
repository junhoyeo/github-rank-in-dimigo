import axios from 'axios';

interface IGitHubProfileAPIResponse {
  data: {
    followers: number;
    public_repos: number;
  }
}

interface INumbersFromAPI {
  followers: number;
  publicRepos: number;
}

export default async function getNumbersFromAPI(userID: string): Promise<INumbersFromAPI> {
  const {
    data: {
      followers,
      public_repos: publicRepos,
    },
  }: IGitHubProfileAPIResponse = await axios.get(`https://api.github.com/users/${userID}`);
  return {
    followers,
    publicRepos,
  };
}
