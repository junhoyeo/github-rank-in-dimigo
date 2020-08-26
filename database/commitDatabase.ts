import publishAsync from '../utils/publishAsync';

export default async function commitDatabase() {
  await publishAsync('.', {
    branch: 'master',
    add: true,
    history: true,
    message: '🎉 Update Database',
    src: 'database/database.json',
    user: {
      name: 'GitHub Actions',
      email: 'actions@github.com',
    },
  });
  console.log('🎉 Updated database.json to master');
}
