from github import Github, UnknownObjectException
from pprint import pprint

def get_user_info(user_id: str):
  github = Github()
  try:
    user = github.get_user(user_id)
  except UnknownObjectException:
    return None
  user_login = user.login
  user_name = user.name
  user_bio = user.bio
  return {
    'id': user_login,
    'name': user_name if user_name else user_login,
    'avatar_url': user.avatar_url,
    'bio': user_bio.strip() if user_bio else None,
    'followers': user.followers,
    'public_repos': user.public_repos
  }

if __name__ == "__main__":
  pprint(get_user_info('junhoyeo'))
