import ghpages from 'gh-pages';

interface IGhPagesConfig {
  src?: string | string[];
  repo?: string;
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
  try {
    await publishAsync('public/build', {
      src: [
        'icons/*',
        'CNAME',
        'favicon.ico',
        'index.html',
        'og-image.png',
      ],
      repo: `https://${process.env.GH_TOKEN}@github.com/junhoyeo/github-rank-in-dimigo.git`,
    });
    console.log('🚀 Published to gh-pages');
  } catch (error) {
    console.log(error, error.stack);
  }
}
