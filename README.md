# Essay Workspace

A React-based workspace for managing Google Docs documents, designed specifically for essay writing and research. The application features a drag-and-drop interface with three customizable panels for your essay, outline, and research resources.

## Features

- Google Docs integration
- Drag-and-drop panel management
- Multi-account support
- Live document preview and editing
- Support for Google Docs, Word documents, and PDFs
- Dark mode interface
- Panel controls:
  - Zoom in/out with visual indicator
  - Pan controls for zoomed documents
  - Toggle between read/write modes
  - Open in new tab
  - Keyboard shortcuts for panel management (Alt + Arrow keys)

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- Google Cloud Platform account with Drive API enabled
- Google OAuth 2.0 credentials

## Dependencies

- luc

## Setup

1. Clone the repository:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
