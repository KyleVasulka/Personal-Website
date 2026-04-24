# Personal Website

A modern Next.js App Router starter for a personal portfolio site, using Tailwind CSS and shadcn-style components.

## Getting Started

Install dependencies and run the development server:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` starts the local development server.
- `npm run build` creates a production build.
- `npm run start` starts the production server.
- `npm run lint` runs ESLint.

## Project Structure

- `app/layout.tsx` contains root metadata and the app shell.
- `app/page.tsx` contains the homepage content.
- `app/globals.css` contains Tailwind theme tokens and base styling.
- `components/ui` contains shadcn-style UI primitives.
- `lib/utils.ts` contains the `cn` class name helper.

## Customization

Update the name, links, projects, and experience in `app/page.tsx`.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js/) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/deployment) for more details.
