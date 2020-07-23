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
    repo: `https://${process.env.GH_TOKEN}@github.com/junhoyeo/github-rank-in-dimigo.git`,
    user: {
      name: 'Junho Yeo',
      email: 'hanaro0704@gmail.com',
    },
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
