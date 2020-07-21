import database
from get_stars import get_stars

import time

users = database.query_all_users()[40:]
for user in users:
  user_stars = get_stars(user['id'])
  if user_stars:
    user['stars'] = user_stars
  user['updated_at'] = int(time.time())

  print(user)
  print('update', database.update_user(user))
