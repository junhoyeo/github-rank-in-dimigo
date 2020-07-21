from tinydb import TinyDB, Query

db = TinyDB('./database.json')

def get_user_by_id(user_id: str):
  User = Query()
  return db.search(User.id == 'junhoyeo')
