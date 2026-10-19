# RISC-M website

The existing HTML pages are preserved. [Eleventy](https://www.11ty.dev/) builds the
Project Showcase from Markdown and copies the site's existing assets into `_site/`.

## Development

Use Node.js 18 or newer:

```sh
npm ci
npm run dev
```

Open the local address printed by Eleventy. `npm run build` generates `_site/`;
`npm test` checks project validation and builds temporary projects to verify cards,
detail pages, draft exclusion, publication ordering, and the sitemap.

## Publish a project

1. Copy `content/projects/project-template.md` to a new `.md` file in the same folder.
2. Fill in its title, unique slug, one or two sentence blurb, publication date,
   GitHub repository URL, and each contributor's name and LinkedIn URL.
3. Set `status` to `in-progress` or `completed`.
4. Write the project details below the front matter. Markdown supports headings,
   lists, code blocks, and images: `![Description](/uploads/project-name/image.png)`.
   Put media in `uploads/`. Use HTML for video embeds when needed.
5. Set `draft: false`, commit, and push to the production branch.

The project appears at `/showcase/your-slug/`. Drafts have no public page and do
not appear in the listing or sitemap. The included template is a draft, so the
showcase initially displays an honest empty state until a real project is added.

Keep `published` fixed after publication. Add an optional `updated: "YYYY-MM-DD"`
when editing progress, and switch status when the project is complete. Status
changes do not change its publication order. Dates use calendar dates in UTC.
Projects can be authored and committed entirely through GitHub's browser editor.

## Cloudflare Pages

For the existing Git-connected Pages project, set:

- **Build command:** `npm run build`
- **Build output directory:** `_site`
- **Root directory:** repository root
- **Node.js version:** 22 (set `NODE_VERSION=22` if needed)

Keep the existing custom domain and production branch. Once these settings are
saved, commits to that branch rebuild the site, including `/showcase/`, project
pages, and the generated sitemap. Publishing still requires your normal GitHub
push/deployment workflow; a local build does not change the live website.

If the site uses Workers rather than Pages, point its static asset directory to
`./_site` and run the same build command in the existing deployment pipeline.

## Optional browser CMS

Markdown publishing through GitHub works immediately. A Decap `/admin/` editor
requires the GitHub repository identity and an OAuth service (for example, a
Cloudflare Worker with a GitHub OAuth application's secrets). Those account
settings are not stored in this repo. Configure authentication before exposing
an admin editor; never place OAuth client secrets in public files.

The content fields are already structured for that future editor: `title`,
`slug`, `blurb`, `published`, `updated`, `status`, `draft`, `github`, and the
`contributors` list (`name`, `linkedin`).
