import axios from 'axios';
import { executeWithRetry } from './rateLimiter';

const GITHUB_GRAPHQL_ENDPOINT = 'https://api.github.com/graphql';

interface PageInfo {
  hasNextPage: boolean;
  endCursor: string | null;
}

interface RepositoryNode {
  stargazerCount: number;
}

interface UserRepositoriesResponse {
  data: {
    user: {
      repositories: {
        pageInfo: PageInfo;
        nodes: RepositoryNode[];
      };
    } | null;
  };
  errors?: Array<{ message: string }>;
}

const USER_REPOS_QUERY = `
query($login: String!, $cursor: String) {
  user(login: $login) {
    repositories(first: 100, after: $cursor, ownerAffiliations: OWNER) {
      pageInfo { hasNextPage, endCursor }
      nodes { stargazerCount }
    }
  }
}
`;

async function fetchGraphQL<T>(
  token: string,
  query: string,
  variables: Record<string, unknown>
): Promise<T> {
  const response = await axios.post<T>(
    GITHUB_GRAPHQL_ENDPOINT,
    { query, variables },
    {
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    }
  );
  return response.data;
}

export async function getTotalStarsForUser(
  token: string,
  login: string
): Promise<number> {
  let totalStars = 0;
  let cursor: string | null = null;
  let hasNextPage = true;

  while (hasNextPage) {
    const result = await executeWithRetry<UserRepositoriesResponse>(() =>
      fetchGraphQL<UserRepositoriesResponse>(token, USER_REPOS_QUERY, {
        login,
        cursor,
      })
    );

    if (result.errors && result.errors.length > 0) {
      throw new Error(`GraphQL Error: ${result.errors[0].message}`);
    }

    if (!result.data.user) {
      throw new Error(`User not found: ${login}`);
    }

    const { repositories } = result.data.user;
    const starCounts = repositories.nodes.map((node) => node.stargazerCount);
    totalStars += starCounts.reduce((sum, count) => sum + count, 0);

    console.log(`[GraphQL] ${login}: fetched ${repositories.nodes.length} repos, stars so far: ${totalStars}`);

    hasNextPage = repositories.pageInfo.hasNextPage;
    cursor = repositories.pageInfo.endCursor;
  }

  return totalStars;
}

export function hasGitHubToken(): boolean {
  return !!process.env.GITHUB_TOKEN;
}

export function getGitHubToken(): string {
  const token = process.env.GITHUB_TOKEN;
  if (!token) {
    throw new Error('GITHUB_TOKEN environment variable is not set');
  }
  return token;
}
