import os.path

__location__ = os.path.realpath(
    os.path.join(os.getcwd(), os.path.dirname(__file__)))

with open(os.path.join(__location__, '../ALLOWLIST')) as allowlist:
    usernames = [username.strip() for username in allowlist.readlines()]

usernames.sort()

with open(os.path.join(__location__, '../ALLOWLIST'), 'w') as allowlist:
    allowlist.write('\n'.join(usernames) + '\n')
