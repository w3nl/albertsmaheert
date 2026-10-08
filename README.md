# albertsmaheert

## Editing the homepage

Homepage text is stored in `src/_data/homepage.json` and can be edited in the Pages CMS web app:

1. Sign in at [app.pagescms.org](https://app.pagescms.org/) with GitHub.
2. Install the Pages CMS GitHub App for this repository.
3. Open the repository, select **Homepage**, edit the labeled fields, and save.

Each save updates the JSON file in GitHub. A push to `main` builds the static site with Eleventy and deploys it to GitHub Pages. The CMS app and your mom's GitHub account both need permission to write to the repository.

Use the Node.js version in `.nvmrc`, then run `npm ci` and `npm run validate`. The generated site is in `_site/`; don't edit generated files.

## Copilot issues

For larger site changes, create an **Agent Task** issue with a clear goal and acceptance criteria. When GitHub Copilot coding agent is enabled for the repository, assign it to the issue and review its pull request before merging.