# Vision

## Purpose
Deliver a daily, high-quality random article experience with minimal friction. Users land, read a brief AI summary and take, and can upvote. The article refreshes once per day for everyone.

## Core Principles
- Daily cadence: one new article per day.
- Human-readable: summaries are short, clear, and respectful of the source.
- Minimal UI: white background, black text, focused reading.
- Reliable: server-rendered and fast to first paint.

## User Experience
- Landing page shows the daily article with:
  - title
  - source link
  - short summary
  - brief AI take
  - upvote count
- The article persists all day; the next day replaces it.

## AI Workflow (Daily)
- A scheduled job selects a random article with loose direction.
- The article is summarized and a short take is generated.
- The result is stored once per day and served to users.

## Data & Operations
- Store the daily article, summary, take, and vote count.
- Track date to ensure a single daily article.
- Admin-only or scheduled process updates the daily article.

## Non-Goals (Now)
- No personalization or user accounts.
- No multi-article feeds.
- No real-time updates beyond the daily refresh.

## Technical Constraints
- Server-rendered React with Bun runtime.
- Deployed to Google Cloud via Docker.
- Tailwind v4 CSS-first styling.
- Prisma for data access.
