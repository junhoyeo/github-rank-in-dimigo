import database

users = database.query_all_users()
print(users)

ranked = sorted(users, key=lambda user: user['stars'], reverse=True)
print(*[user['name'] for user in ranked], sep='\n')
