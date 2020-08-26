import ghpages from 'gh-pages';

interface IGhPagesConfig {
  branch?: string;
  src?: string | string[];
  repo?: string;
  message?: string;
  add?: boolean;
  history?: boolean;
  user?: {
    name: string;
    email: string;
  }
}

export default function publishAsync(directoryName: string, config: IGhPagesConfig = {}): Promise<void> {
  const publishConfig = {
    ...config,
    repo: `https://${process.env.GITHUB_TOKEN}@github.com/junhoyeo/github-rank-in-dimigo.git`,
  }
  return new Promise((resolve, reject) => {
    ghpages.publish(directoryName, publishConfig, (error: Error) => {
      if (error) {
        reject(error);
      }
      ghpages.clean();
      resolve();
    });
  });
};
