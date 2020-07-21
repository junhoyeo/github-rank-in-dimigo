import database

import datetime
from jinja2 import Environment, FileSystemLoader

file_loader = FileSystemLoader('.')
env = Environment(loader=file_loader)

template = env.get_template('template.html')

ranked = sorted(
  database.query_all_users(),
  key=lambda user: (user['stars'], user['followers'], user['public_repos']),
  reverse=True
)

ranked_users = []
current_rank = 0
previous_stars = None

for user in ranked:
  user_stars = user['stars']
  if user_stars < 1:
    continue

  timestamp = user['updated_at']
  user['updated_at'] = str(datetime.datetime.fromtimestamp(timestamp))

  user_bio = user['bio']
  user['bio'] = user_bio if user_bio else '소개 없음'

  if user_stars != previous_stars:
    current_rank += 1
  user['rank'] = current_rank
  previous_stars = user_stars

  ranked_users.append(user)

output = template.render(ranked_users=ranked_users)

with open('./build/index.html', 'w') as file_pointer:
  file_pointer.write(output)
