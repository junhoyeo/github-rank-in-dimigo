import database

def check_bio_linebreaks(user):
  if user['bio'] and '\r\n' in user['bio']:
    words = [
      word
      for word in user['bio'].split('\r\n')
      if word
    ]
    user['bio'] = ' '.join(words)
    print('update', database.update_user(user))

if __name__ == '__main__':
  users = database.query_all_users()

  for user in users:
    if user['bio'] and '\r\n' in user['bio']:
      words = [
        word
        for word in user['bio'].split('\r\n')
        if word
      ]
      user['bio'] = ' '.join(words)
      print('update', database.update_user(user))
