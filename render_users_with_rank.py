import database

import datetime
from jinja2 import Environment, FileSystemLoader

file_loader = FileSystemLoader('.')
env = Environment(loader=file_loader)

template = env.get_template('template.html')

users = []
for user in database.query_all_users():
  timestamp = user['updated_at']
  user['updated_at'] = str(datetime.datetime.fromtimestamp(timestamp))

  user_bio = user['bio']
  user['bio'] = user_bio if user_bio else '소개 없음'

  if user['stars'] > 0:
    users.append(user)

ranked = sorted(
  users,
  key=lambda user: (user['stars'], user['followers'], user['public_repos']),
  reverse=True
)

output = template.render(ranked_users=ranked)

with open('./build/index.html', 'w') as file_pointer:
  file_pointer.write(output)
