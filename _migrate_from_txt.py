import database
from get_user_info import get_user_info
from get_stars import get_stars
from _update_bio_linebreaks_with_spaces import check_bio_linebreaks

import time

with open('./dimigo.input.txt', 'r') as file_pointer:
  user_list = [
    line.strip()
    for line in file_pointer.readlines()
  ]
print(user_list)

for user_id in user_list:
  if database.query_user_by_id(user_id):
    print(f'skipping {user_id}...')
    continue
  user = get_user_info(user_id)
  if not user:
    print(f'skipping(invalid user) {user_id}...')
    continue
  user['stars'] = get_stars(user_id)
  user['updated_at'] = int(time.time())
  check_bio_linebreaks(user)
  print(user)

  print('insert', database.insert_user(user))
