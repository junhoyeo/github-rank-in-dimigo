import database

if __name__ == '__main__':
  users = database.query_all_users()

  for user in users:
    if not user['name']:
      user['name'] = user['id']
      print('update', database.update_user(user))
