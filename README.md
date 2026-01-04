# App Store Preview

A comprehensive ASO (App Store Optimization) and Creative Brief management platform for mobile apps.

## Features

- **Keyword Research & Analysis**: Import, manage, and optimize keywords with priority scoring and recommendations
- **Creative Brief**: Complete creative strategy documentation with visual references, color palettes, typography, and screenshot messaging
- **Apple Search Ads Strategy**: Configure ASA campaigns with keyword groups and targeting
- **Competitor Analysis**: Track and analyze competitor apps with detailed insights
- **Store Page Preview**: Preview iOS and Android store listings with real-time updates

## Tech Stack

- **Framework**: Next.js 16 (App Router)
- **Database**: Supabase (PostgreSQL)
- **Styling**: Tailwind CSS
- **UI Components**: Radix UI
- **TypeScript**: Full type safety

## Getting Started

### Prerequisites

- Node.js 18+ and pnpm
- Supabase account and project

### Environment Variables

Create a `.env.local` file with the following variables:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### Installation

```bash
pnpm install
```

### Database Setup

Run the SQL migration scripts in order:

1. `scripts/001_create_app_data_tables.sql`
2. `scripts/002_add_platform_column.sql`
3. `scripts/002_create_keywords_table.sql`
4. `scripts/003_create_screenshot_messaging.sql`
5. `ADD_CREATIVE_BRIEF_FIELDS.sql`
6. `ADD_CREATIVE_BRIEF_VISUAL_REFERENCES.sql`
7. `ADD_CREATIVE_BRIEF_COLORS_TYPOGRAPHY.sql`
8. `ADD_CREATIVE_BRIEF_ASA_KEYWORD_GROUPS.sql`
9. `UPDATE_CREATIVE_BRIEF_COMPETITOR_ANALYSIS.sql`

### Development

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Build

```bash
pnpm build
pnpm start
```

## Deployment

This project is optimized for deployment on Vercel.

### Vercel Deployment

1. Push your code to GitHub
2. Import your repository in Vercel
3. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. Deploy!

## Project Structure

```
├── app/              # Next.js app router pages
│   ├── admin/        # Admin panel
│   └── preview/      # Preview pages
├── components/       # React components
├── lib/              # Utilities and types
└── scripts/          # SQL migration scripts
```

## License

Private - All rights reserved
