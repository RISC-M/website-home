# Maintaining the RISC-M website

For instructions on adding a project post, start with the [README](../../README.md).
This guide covers the site code, local development, and hosting.

## Repository structure

```text
posts/                       Project posts; add Markdown files directly here
  example.md                 Draft starter post with image and video examples
  media/                     Project images and diagrams, grouped by slug
site/                        All website implementation files
  pages/                     Homepage, about, sponsorship, showcase, and sitemap
  layouts/                   Shared showcase and project page layouts
  public/
    styles/                  Site and showcase CSS
    scripts/                 Site and showcase JavaScript
    images/                  Club logos and board photos
    robots.txt               Search crawler configuration
    favicon.*                Browser icons
    google*.html             Search Console verification file
  docs/                      Maintenance instructions
  tests/                     Automated checks
  tools/                     Build and project validation code
  eleventy.config.cjs        Page input, layouts, collections, and copy settings
package.json                 Development commands and dependencies
wrangler.json                Cloudflare Worker settings
```

Eleventy reads Markdown from `posts/` and page templates from `site/pages/`.
The configuration supplies the project layout and URL rules, keeping code out of
the posts folder. The three existing HTML pages are copied to their public routes.

Everything in `site/public/` is copied to the site root:
`site/public/styles/site.css` becomes `/styles/site.css`. Project media is copied
separately: `posts/media/example/diagram.png` becomes `/media/example/diagram.png`.

`_site/` is generated and ignored by Git. Change the source files above; the next
build replaces `_site/`. The README and maintenance documentation are excluded
from the published site. The example post stays unpublished through `draft: true`.

## Local development

Use Node.js 18 or newer. Run these commands from the repository root:

```sh
npm ci
npm run dev
```

Open the local address printed by Eleventy. Preview the homepage, `/showcase/`,
and the project page you changed. Posts with `draft: true` are excluded from the
local preview as well; set `draft: false` in your working branch to preview one.

To check a change before submitting it:

```sh
npm test
npm run build
```

Tests cover project validation, draft exclusion, publication order, contributor
credit, project routes, filtering, sorting, and return navigation. They also copy
the starter into `posts/` to verify the documented publishing workflow, and check
that page links and project media resolve after building.

The build clears old output before generating the site, so removed posts do not
leave published pages behind.

## Project publishing rules

- Each post is a Markdown file directly inside the root `posts/` folder.
- `site/eleventy.config.cjs` supplies the project layout, URL rules, and draft handling.
- `site/tools/projects.cjs` validates metadata and orders published projects.
- Slugs must be unique and use lowercase words separated by hyphens.
- Dates must be real calendar dates. `updated` must be on or after `published`.
- The current schema requires a GitHub URL and a LinkedIn URL for every contributor.
- Drafts are omitted from the showcase, generated project pages, and sitemap.
- Publication order uses `published`, then the title to break ties. Changing status
  or `updated` does not move a post to the top.

Project media belongs in `posts/media/<project-slug>/`. Keep content and media
changes in the same pull request when adding or renaming images.

## If a build fails

Read the first validation error; it names the project file and the field to fix.
Common causes are an invalid date, a duplicate slug, a status other than
`in-progress` or `completed`, or an incomplete contributor name/link pair. GitHub
and LinkedIn links must use HTTPS and the correct host.

If a post is missing, check `draft`, confirm the file is directly inside `posts/`,
and check that the deployment containing it finished successfully. For a missing
image, check that the file exists in `posts/media/` and that the post uses the
matching `/media/` URL, including filename capitalization.

## Cloudflare Workers deployment

The existing site uses a Git-connected Worker named `website-home`. Its checked-in
`wrangler.json` points to `./_site`. Keep the repository root as the build root.

| Setting | Value |
| --- | --- |
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy --assets ./_site` |
| Version command | `npx wrangler versions upload --assets ./_site` |
| Root directory | `/` |

The asset directory is also declared in `wrangler.json`, so the deploy and version
commands can omit `--assets ./_site`. Keep the existing custom domain and production
branch. A local build prepares the output; the Git-connected deployment publishes
it after changes reach the configured production branch.

## Cloudflare Pages alternative

If the repository is hosted with Pages instead of the existing Worker, use
`npm run build` as the build command, `_site` as the output directory, and `/` as the
root directory. Use a Node.js version supported by `package.json` and preserve the
existing custom domain and production branch.
