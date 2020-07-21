import pandas
import pygithubutils.repo_stats as github_repo_stats

def get_stars(user_id: str) -> int:
  dat = pandas.DataFrame(None)

  counts = github_repo_stats.repo_prober(user_id, None, None, True)[0]
  d = pandas.DataFrame([c[1:] for c in counts], index=[c[0]
                        for c in counts], columns=['stars'])
  dat = pandas.concat((dat, d))

  datnz = dat[~(dat == 0).all(axis=1)].drop_duplicates()
  pandas.set_option('display.max_rows', 500)

  return datnz['stars'].sum()

if __name__ == '__main__':
  print(get_stars('junhoyeo'))
