---
# Copy this file to posts/your-project-name.md, then replace the examples.
title: "Your project title"
slug: "your-project-title"
blurb: "Describe what you are building and why it matters in one or two sentences."
# Replace with the date you first publish this post (YYYY-MM-DD).
published: "2026-10-19"
# Use in-progress or completed.
status: "in-progress"
# Change to false when the post is ready to publish.
draft: true
github: "https://github.com/RISC-M/your-project"
# Add a name and LinkedIn URL for every contributor.
contributors:
  - name: "Your name"
    linkedin: "https://www.linkedin.com/in/your-profile/"
# For later edits, uncomment this and replace the date. Keep published unchanged.
# updated: "2026-10-20"
---

## Overview

What are you building, and what problem does it solve?

## How it works

Explain your design and the decisions behind it. Include diagrams, screenshots,
or code where they help readers understand the work.

## Progress and lessons learned

Share what works today, what was challenging, and what you learned. Add results
or a demo if you have them, and explain what you plan to try next.

## Team contributions

Give each teammate credit for the parts they worked on. Adjust or remove this
section if you have already covered contributions elsewhere.

## Adding images and videos

Create a folder for your project at `posts/media/your-project-title/` and upload
your images or videos there. Replace `your-project-title` with your project's
slug and use the exact filenames you uploaded, including capitalization.

In the post, use `/media/your-project-title/` for media URLs. For example,
`posts/media/your-project-title/architecture.png` becomes
`/media/your-project-title/architecture.png` on the website.

The snippets below show what to paste into your post. Leave out the surrounding
triple backticks when you want the image or video to display.

### Image

Upload `architecture.png`, then add this Markdown where you want the image:

```markdown
![Diagram showing the processor pipeline and its main components](/media/your-project-title/architecture.png)
```

Replace the description inside `[...]` with a useful description of your image.
You can add a caption as a normal paragraph below it.

### Uploaded video

Upload `demo.mp4` to the same media folder, then add this HTML. Readers can play,
pause, and seek through the video using its controls.

```html
<video controls preload="metadata">
  <source src="/media/your-project-title/demo.mp4" type="video/mp4">
  <a href="/media/your-project-title/demo.mp4">Download the project demo</a>.
</video>
```

To show a thumbnail before playback, add
`poster="/media/your-project-title/architecture.png"` to the opening `<video>`
tag. Both images and videos automatically fit the post's width.

### Video hosted on YouTube

You can embed a video hosted on YouTube instead of uploading an MP4. Replace
`YOUR_VIDEO_ID` with the ID after `v=` in its watch URL (or after `youtu.be/` in a
short link), and give the frame a descriptive title.

```html
<iframe
  src="https://www.youtube.com/embed/YOUR_VIDEO_ID"
  title="Project demonstration"
  loading="lazy"
  allowfullscreen>
</iframe>
```

For a simple link instead of an embedded player, use:

```markdown
[Watch the project demo](https://www.youtube.com/watch?v=YOUR_VIDEO_ID)
```
