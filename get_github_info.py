from github import Github
from pprint import pprint

def get_user_info(user_id: str):
  github = Github()
  user = github.get_user(user_id)
  return {
    'id': user.login,
    'name': user.name,
    'avatar_url': user.avatar_url,
    'bio': user.bio.strip(),
    'followers': user.followers,
    'public_repos': user.public_repos
  }

if __name__ == "__main__":
  pprint(get_user_info('junhoyeo'))
