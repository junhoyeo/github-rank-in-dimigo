import publishAsync from '../utils/publishAsync';

export default async function commitDatabase() {
  await publishAsync('.', {
    branch: 'master',
    add: true,
    history: true,
    message: '🎉 Update Database',
    src: 'database/database.json',
  });
  console.log('🎉 Updated database.json to master');
}
