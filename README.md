# albertsmaheert

## Editing the homepage

Homepage text is stored in `src/_data/homepage.json` and can be edited in the Pages CMS web app:

1. Sign in at [app.pagescms.org](https://app.pagescms.org/) with GitHub.
2. Install the Pages CMS GitHub App for this repository.
3. Open the repository, select **Homepage**, edit the labeled fields, and save.

Each save updates the JSON file in GitHub. A push to `main` builds the static site with Eleventy and deploys it to GitHub Pages. The CMS app and your mom's GitHub account both need permission to write to the repository.

To build the site locally, run `npm ci` and then `npm run build`. The generated site is in `_site/`; don't edit generated files.