import os
os.system('github-pages-publish -m "Update" -V . ./build')
os.system('git push origin gh-pages')
