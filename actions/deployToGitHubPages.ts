import publishAsync from '../utils/publishAsync';

export default async function deployToGitHubPages(): Promise<void> {
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
}
