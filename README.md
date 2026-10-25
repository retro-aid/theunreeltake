![The Unreel Take Logo](docs/images/unreel_logo_web.png)

---

## About

The Unreel Take is a curated library of reviews for a wide variety of media such as: movies, TV shows, video games and more! 
Run by a small team of passionate hobbyists, The Unreel Take team judges entertainment based not just on quality alone, but the overall experience you're likely to have.
The team are committed to delivering high-value, no-AI, no nonsense and free-to-read articles so that you can find the *experience* that you're looking for.

## Project Overview

**The Problem:** The Product Owner needs a blog-posting and content management system website that allows for the creation and management of articles.

**Our Solution:**

 **Public Page:** Our frontend solution implements a public home route complete with a searchable catalog, an about page, and media request form.
- **Admin dashboard:** Our backend solution implements a private, invitation-only, user dashboard with a suite of content management tools such as: Manage posts and drafts, tags, templates, trivia, comments, review requests, users, and analytics.
- **Backend:** Next.js server actions and routes, Prisma ORM, and a PostgreSQL database hosted with Neon.

### Public home page
![Frontend Home Page](docs/images/frontend.webp)

### Admin dashboard
![Admin Dashboard](docs/images/dashboard.jpg)

### Trivia page
![Trivia Page](docs/images/trivia.jpg)

### Blog post page
![Blog Post Page](docs/images/blogpost.jpg)

## Tech Stack

| Type           | Technologies                  |
|----------------|-------------------------------|
| Frontend       | Next.js, React.js, Mantine UI |
| Backend        | Node.js, TypeScript           |
| Database       | Prisma ORM, Neon PostgreSQL   |
| Deployment     | Vercel                        |
| Documentation  | Typedoc with TSDoc comments   |
| Testing        | Vitest                        |
| Authentication | Better Auth                   |
| Analytics      | Google Analytics              |
| Email          | Resend                        |

---

## Sprint Timeline

For each sprint, we focused our efforts on delivering fully functional features. 
We wanted the website to be usable at every stage of development which allowed us to gain client feedback on overall direction.

### Sprint 1 - Project Charter & Website Mockup

Setting up of the project charter document and creation of the initial website mockup.
The client gave us much freedom over the website design, so the mockup was necessary for feature visualization.

### Sprint 2 - User Invitation & Account Setup

We started with the first high-priority feature request: user invitation and new user account setup. 
These features allow any site administrators to control user access and accounts to invitees only. 

### Sprint 3 - Rich Text Editor & Post Management

This sprint marked the implementation of the second high-priority feature: a rich text editor and post management views.
These features allowed users to begin modifying and creating new content to the site.

### Sprint 4 - Content Tagging, Request Management & Post Drafts

This marks the point we started work on new database schemas to implement content tagging, media requests and post drafting.
The features implemented here allowed users to begin categorizing their content and respond to audience feedback.

### Sprint 5 — Public engagement, trivia, requests, and analytics

Delivered dashboard card refactoring, catalog pagination fixes, a trivia landing page, anonymous comments, view and active-user analytics, request management, related posts, login and settings page refinements, newsletter pages, post templates, and trivia question editing and management.

### Sprint 6 — Content workflows, comments, and analytics

Expanded the catalog and dashboard workflows with tag filtering, sorting, refresh actions, multi-tag posts, images, reusable rich-text templates, comment replies and search, and new dashboard analytics.

### Sprint 7 — Access control, testing, and feature structure

Added role-based route protection and user analytics, improved forms and layout, introduced Vitest and feature-focused test suites, and migrated feature areas to a more consistent structure.

### Sprint 8 — Current sprint (as of October 22, 2026)

Focus areas include trivia data and filtering, analytics integrations, catalog fixes, dashboard improvements, post and account workflows, and project documentation via typedoc.

## Developer Instructions

### Prerequisites

- Node.js 22
- pnpm
- A PostgreSQL database, such as a Neon development database
- Git

### Setup

1. Clone the repository and enter the project directory:

   ```sh
   git clone git@github.com:retro-aid/theunreeltake.git
   cd theunreeltake
   ```

2. Create a `.env` file in the project root. Never commit this file or put real credentials in source control.

   ```dotenv
   DATABASE_URL="postgresql://USER:PASSWORD@HOST/DATABASE?sslmode=require"
   SHADOW_DATABASE_URL="postgresql://USER:PASSWORD@HOST/SHADOW_DATABASE?sslmode=require"
   BETTER_AUTH_SECRET="replace-with-a-long-random-secret"
   BETTER_AUTH_URL="http://localhost:3000"
   RESEND_API_KEY=""
   RESEND_FROM="noreply.theunreeltake@resend.dev"
   AUTH_GOOGLE_ID=""
   AUTH_GOOGLE_SECRET=""
   ```

   Use database credentials supplied for development. `SHADOW_DATABASE_URL` must point to a separate database that Prisma can use for development migrations. Email sending requires a valid Resend API key and sender.

3. Install dependencies. The install lifecycle generates the Prisma client:

   ```sh
   pnpm install
   ```

4. Apply the existing migrations to your development database:

   ```sh
   pnpm exec prisma migrate dev
   ```

5. Start the development server:

   ```sh
   pnpm run dev
   ```

   Visit [http://localhost:3000](http://localhost:3000).

## Testing

The project uses [Vitest](https://vitest.dev/) for automated tests. The current test suite is in `__tests__/` and covers posts, comments, tags, review requests, authentication, and analytics. Tests use Vitest's Node environment, load environment variables through `dotenv/config`, and mock Prisma and authentication where needed.
Run the interactive test watcher:

```sh
pnpm test
```

Run the full suite once:

```sh
pnpm exec vitest run
```

Run one test file:

```sh
pnpm exec vitest run __tests__/posts.test.ts
```

## Team

**Product Owner:** Brandon Eiland

| Team Coffee Coders    |
|-----------------------|
| Aidan Anderson        |
| Brian Segura Chagolla |
| Elias Rangel          |
| Izak Puente Zavala    |
| Jalen Sun             |
| Logan Jenkins         |
| Melvin Ly             |
| Preston Stevenson     |
