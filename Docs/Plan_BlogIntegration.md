# Blog Section Implementation Plan

## Context
- Angular standalone components app
- `ngx-markdown` is already installed and needs to be wired up
- Hosted on GitHub Pages (static, no SSR)
- Do NOT use any backend or CMS — everything is file-based under `assets/`

## Goals
1. Add a Blog button in the existing hero section linking to `/blog`
2. Add a "Latest Articles" preview section in the landing page (last 3 posts)
3. Full blog list page at `/blog` (reverse chronological order)
4. Individual article page at `/blog/:slug`

---

## Step 1 — Wire up ngx-markdown

In `app.config.ts`, add:
```ts
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';
// add provideHttpClient() and provideMarkdown() to the providers array
```

---

## Step 2 — Static Assets Structure

Create the following files:

**`public/blog/index.json`** (or `src/assets/blog/index.json` depending on Angular version):
```json
[
  {
    "slug": "example-post",
    "title": "Example Post",
    "date": "2026-03-12",
    "excerpt": "A short description shown in previews."
  }
]
```

**`public/blog/example-post.md`**:
```markdown
# Example Post

This is the content of the first blog post.
```

---

## Step 3 — Blog Service

Create `src/app/blog/blog.service.ts`:
- `getPosts()`: fetches `assets/blog/index.json`, returns posts sorted by date descending
- `getLatestPosts(n: number)`: returns first N posts from `getPosts()`

---

## Step 4 — Routes

Add to the app router:
```
/blog        → BlogListComponent
/blog/:slug  → BlogPostComponent
```

---

## Step 5 — Components to Create

### `BlogListComponent` (`/blog`)
- Fetches all posts from `BlogService`
- Displays them in reverse chronological order
- Each item shows: title, date, excerpt, and a "Read more" link to `/blog/:slug`

### `BlogPostComponent` (`/blog/:slug`)
- Reads `:slug` from route params
- Renders `<markdown [src]="'/assets/blog/' + slug + '.md'"></markdown>`
- Includes a "← Back to Blog" link

### `BlogPreviewSectionComponent` (for landing page)
- Fetches latest 3 posts via `BlogService`
- Shows a card/preview per article: title, date, excerpt, "Read more" link
- To be embedded in the main landing page component

---

## Step 6 — Landing Page Changes

In the **hero section** component:
- Add a button/link styled consistently with existing CTA buttons, labeled "Read the Blog" or similar, routing to `/blog`

In the **main landing page** component:
- Add `<app-blog-preview-section>` as a new section after the existing content sections

---

## Style Instructions
- Inspect the existing components for color palette, font sizes, spacing, button styles, and card patterns
- Match the visual language exactly — do not introduce new design patterns
- Blog cards in the preview section should feel native to the current UI, not like a third-party widget
