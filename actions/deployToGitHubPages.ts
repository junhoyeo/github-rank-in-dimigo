import ghpages from 'gh-pages';

interface IGhPagesConfig {
  src?: string | string[];
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
    });
    console.log('🚀 Published to gh-pages');
  } catch (error) {
    console.log(error, error.stack);
  }
}
