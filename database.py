from tinydb import TinyDB, Query

db = TinyDB('./database.json')

def query_user_by_id(user_id: str):
  User = Query()
  return db.search(User.id == user_id)

def query_all_users():
  return db.all()

def insert_user(user) -> bool:
  if query_user_by_id(user['id']):
    return False
  db.insert(user)
  return True
