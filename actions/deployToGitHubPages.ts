import ghpages from 'gh-pages';

interface IGhPagesConfig {
  src?: string | string[];
  repo?: string;
  user?: {
    name: string;
    email: string;
  }
}

const publishAsync = (directoryName: string, config: IGhPagesConfig = {}) => {
  return new Promise((resolve, reject) => {
    ghpages.publish(directoryName, config, (error: Error) => {
      if (error) {
        reject(error);
      }
      resolve();
    });
  });
};

export default async function deployToGitHubPages(): Promise<void> {
  await publishAsync('public/build', {
    src: [
      'icons/*',
      'CNAME',
      'favicon.ico',
      'index.html',
      'og-image.png',
    ],
    repo: `https://${process.env.GH_TOKEN}@github.com/junhoyeo/github-rank-in-dimigo.git`,
    user: {
      name: 'Junho Yeo',
      email: 'hanaro0704@gmail.com',
    },
  });
  console.log('🚀 Published to gh-pages');
}
