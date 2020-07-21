import requests
from bs4 import BeautifulSoup

def _count_stars_from_url(url: str) -> int:
  response = requests.get(url)
  soup = BeautifulSoup(response.text, 'html.parser')
  star_counts = [
    int(anchor.text.strip())
    for anchor in soup.select('a.muted-link.mr-3')
    if 'stargazers' in anchor.attrs['href']
  ]
  print(star_counts)
  next_button = soup.select_one('a.btn.btn-outline.BtnGroup-item:last-child')
  if next_button and 'Next' in next_button.text:
    next_url = next_button['href']
    return sum(star_counts) + _count_stars_from_url(next_url)
  return sum(star_counts)

def get_stars(user_id: str) -> int:
  return _count_stars_from_url(f'https://github.com/{user_id}?tab=repositories')

if __name__ == '__main__':
  print(get_stars('junhoyeo'))
