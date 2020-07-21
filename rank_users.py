import database

users = database.query_all_users()
print(users)

ranked = sorted(users, key=lambda user: user['stars'], reverse=True)
print(*[user for user in ranked], sep='\n')
