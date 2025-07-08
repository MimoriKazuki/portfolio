# Portfolio Site

A modern portfolio website built with Next.js, TypeScript, and Tailwind CSS, featuring a YouTube-style dark theme design.

## Features

- 🎨 YouTube-style dark theme UI
- 📱 Fully responsive design
- 🗂️ Project categorization (Homepage, Landing Page, Web App, Mobile App)
- 👤 Profile management
- 🔐 Admin panel for content management
- 🚀 Powered by Supabase for data storage
- ⚡ Built with Next.js 15 for optimal performance

## Tech Stack

- **Frontend**: Next.js 15, React 18, TypeScript
- **Styling**: Tailwind CSS, Shadcn UI
- **Database**: Supabase (PostgreSQL)
- **Deployment**: Vercel

## Getting Started

### Prerequisites

- Node.js 20.x or later
- npm or yarn
- Supabase account

### Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd tube-tide-online
```

2. Install dependencies:
```bash
npm install
```

3. Set up environment variables:
```bash
cp .env.local.example .env.local
```

4. Update `.env.local` with your Supabase credentials:
```
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
ADMIN_EMAIL=your_admin_email
```

5. Set up the database:
   - Go to your Supabase project dashboard
   - Navigate to SQL Editor
   - Execute the SQL from `/supabase/schema.sql`
   - (Optional) Execute sample data from `/supabase/sample-data.sql`

6. Run the development server:
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the site.

## Project Structure

```
├── app/                    # Next.js app directory
│   ├── admin/             # Admin panel pages
│   ├── components/        # Reusable components
│   ├── lib/              # Utilities and libraries
│   └── types/            # TypeScript type definitions
├── public/               # Static assets
├── supabase/            # Database schema and migrations
└── ...config files
```

## Admin Panel

Access the admin panel at `/admin` to:
- Manage projects (create, edit, delete)
- Update profile information
- Control featured projects
- Organize project order

## Deployment

### Vercel

1. Push your code to GitHub
2. Import the project in Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

## Environment Variables

Required environment variables for production:

- `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY` - Supabase service role key
- `ADMIN_EMAIL` - Admin email for authentication

## License

This project is private and proprietary.
