# RISC-M Project Showcase

Share what you are building with the club. Projects can be in progress or complete;
a few clear paragraphs are enough to get started. Each post gets its own page,
project links, and credit for the people involved.

## Add a project post

You can do this entirely on GitHub, without installing anything.

1. Open the [example post](posts/example.md) and copy its contents.
2. Open [posts](posts), choose **Add file → Create new file**, and
   name your file after the project, such as `branch-predictor.md`. Paste in the template.
3. Replace the details between the two `---` lines using the guide below. List
   everyone who contributed to the project.
4. Write your post below the second `---`. Explain what you are building, how it
   works, and what you have learned. Use the suggested headings or choose your own.
5. Set `draft: false` when the post is ready. Commit your file to a new branch and
   open a pull request. Once it is merged into the production branch and the site
   build finishes, your post will appear in the [showcase](https://www.risc-m.com/showcase/).

For a filled-out example, see [What is RISC-M?](posts/what-is-risc-m.md).

### Fill in the project details

Keep the field names as they appear in the template. Replace the example values;
keep quotes around text and dates, and use spaces for indentation.

| Field | What to enter |
| --- | --- |
| `title` | The project name readers will see. |
| `slug` | A unique, permanent URL name: lowercase words separated by hyphens, such as `branch-predictor`. Your page will be `/showcase/branch-predictor/`. |
| `blurb` | One or two sentences explaining the project. This appears on the showcase card. |
| `published` | The date you first publish the post, in `YYYY-MM-DD` format. |
| `status` | `in-progress` or `completed`. Both belong in the showcase. |
| `draft` | `true` while you are writing; `false` when ready to publish. Drafts have no public post or showcase card. |
| `github` | The project's full HTTPS GitHub URL. |
| `contributors` | Each contributor's name and full HTTPS LinkedIn URL. Repeat the name/link pair for each teammate, as shown below. |
| `updated` | Optional. The date of a later update, in `YYYY-MM-DD` format. |

For a team project, list each person separately:

```yaml
contributors:
  - name: "First contributor"
    linkedin: "https://www.linkedin.com/in/first-contributor/"
  - name: "Second contributor"
    linkedin: "https://www.linkedin.com/in/second-contributor/"
```

You can also explain each person's contribution in the post itself, especially
when teammates worked on different parts of the design.

### Add images, diagrams, or a demo

Create a folder for your project in [posts/media](posts/media), for example
`posts/media/branch-predictor/`. On GitHub, use **Add file → Upload files** to add
your media there. Keep filenames simple, such as `architecture.png`.

In your post, reference it with `/media/<project-slug>/<filename>`:

```markdown
![Diagram of the branch prediction pipeline](/media/branch-predictor/architecture.png)
```

Use descriptive image text so readers can understand the image's purpose. For a
demo hosted elsewhere, add a normal link:

```markdown
[Watch the project demo](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
```

Markdown also supports `## Headings`, **bold text**, lists, links, tables, and fenced
code blocks. Media is optional; publish a useful explanation first and add more later.

## Update an existing post

Edit your project's file in [posts](posts) and submit the change in
a pull request. Keep the original `slug` so shared links continue to work, and keep
`published` unchanged so the post retains its place in the publication order.

Add or change `updated` to the date of your update. Change `status` to `completed`
when the project is finished, and update the contributor list as teammates join.

## Find your way around

```text
posts/                Add and edit your Markdown posts here
  media/              Images and diagrams, grouped by project slug
site/                 Website code, styles, layouts, tools, and tests
README.md             This posting guide
```

The [example post](posts/example.md) includes image and video snippets to copy.
For development and hosting instructions, see the
[website maintenance guide](site/docs/maintaining.md).
