# Scroll Tracking Platform - Next.js

A modern, lightweight scroll tracking platform built with Next.js, Supabase, and Tailwind CSS.

## Features

- 🚀 **Lightweight Tracking Script** - Minimal performance impact
- 📊 **Real-time Analytics** - View scroll data as it happens
- 🔒 **Privacy-Focused** - No personal data collection
- 🎯 **Milestone Tracking** - Track 25%, 50%, 75%, and 100% scroll depth
- 📱 **Responsive Dashboard** - Beautiful, mobile-friendly interface
- 🔐 **User Authentication** - Secure user management with Supabase Auth
- 📈 **Interactive Charts** - Visualize scroll patterns with Chart.js

## Tech Stack

- **Frontend**: Next.js 15, React, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: Supabase (PostgreSQL)
- **Authentication**: Supabase Auth
- **Charts**: Chart.js with react-chartjs-2
- **Validation**: Zod

## Quick Start

### 1. Clone and Install

```bash
git clone <your-repo>
cd nextjs-scrolltracker
npm install
```

### 2. Set up Supabase

1. Create a new project at [supabase.com](https://supabase.com)
2. Run the SQL schema in your Supabase SQL editor:

```sql
-- Create trackers table
CREATE TABLE IF NOT EXISTS trackers (
  id TEXT PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create scroll_events table
CREATE TABLE IF NOT EXISTS scroll_events (
  id BIGINT GENERATED ALWAYS AS IDENTITY PRIMARY KEY,
  tracker_id TEXT REFERENCES trackers(id) ON DELETE CASCADE,
  scroll_depth SMALLINT NOT NULL CHECK (scroll_depth >= 0 AND scroll_depth <= 100),
  page_url TEXT NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL,
  ua TEXT,
  viewport_w INTEGER CHECK (viewport_w > 0 AND viewport_w <= 20000),
  viewport_h INTEGER CHECK (viewport_h > 0 AND viewport_h <= 20000),
  ip_address TEXT
);

-- Enable RLS
ALTER TABLE trackers ENABLE ROW LEVEL SECURITY;
ALTER TABLE scroll_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies for trackers
CREATE POLICY "Users can view their own trackers" ON trackers
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own trackers" ON trackers
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own trackers" ON trackers
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own trackers" ON trackers
  FOR DELETE USING (auth.uid() = user_id);

-- RLS Policies for scroll_events
CREATE POLICY "Users can view events for their trackers" ON scroll_events
  FOR SELECT USING (
    tracker_id IN (
      SELECT id FROM trackers WHERE user_id = auth.uid()
    )
  );

CREATE POLICY "Service role can insert events" ON scroll_events
  FOR INSERT WITH CHECK (true);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_trackers_user_id ON trackers(user_id);
CREATE INDEX IF NOT EXISTS idx_scroll_events_tracker_id ON scroll_events(tracker_id);
CREATE INDEX IF NOT EXISTS idx_scroll_events_occurred_at ON scroll_events(occurred_at);
CREATE INDEX IF NOT EXISTS idx_scroll_events_tracker_occurred ON scroll_events(tracker_id, occurred_at);
```

3. Enable Email authentication in Supabase Auth settings

### 3. Environment Variables

Copy `env.example` to `.env.local`:

```bash
cp env.example .env.local
```

Fill in your Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

### 4. Run the Development Server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Usage

### 1. Create an Account

1. Go to `/dashboard`
2. Sign up with your email and password
3. Create your first tracker

### 2. Add Tracking to Your Website

Copy the embed code from your dashboard:

```html
<script
  src="https://your-domain.com/api/tracker.js?id=YOUR_TRACKER_ID"
  async
></script>
```

Add it to your website's HTML, preferably before the closing `</body>` tag.

### 3. View Analytics

- Go to your dashboard
- Select a tracker from the dropdown
- Click "Refresh" to load events
- View scroll depth charts and milestone statistics

## API Endpoints

### GET `/api/tracker.js?id=TRACKER_ID`

Returns the tracking script for the specified tracker ID.

**Query Parameters:**

- `id` (required): The tracker ID

**Response:** JavaScript tracking script

### POST `/api/track`

Accepts scroll tracking events.

**Request Body:**

```json
{
  "trackerId": "string",
  "scrollDepth": 0-100,
  "pageUrl": "string",
  "timestamp": 1234567890,
  "device": {
    "ua": "string",
    "width": 1920,
    "height": 1080
  }
}
```

**Response:** 204 No Content on success

## Deployment

### Vercel (Recommended)

1. Push your code to GitHub
2. Connect your repository to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy!

### Other Platforms

The app can be deployed to any platform that supports Next.js:

- Netlify
- Railway
- DigitalOcean App Platform
- AWS Amplify

## Production Considerations

### Security

- ✅ HTTPS enforced
- ✅ Input validation with Zod
- ✅ Rate limiting (consider adding Redis for production)
- ✅ Row Level Security (RLS) enabled
- ✅ No PII collection

### Performance

- ✅ Lightweight tracking script (~3KB)
- ✅ Throttled scroll events
- ✅ Efficient database queries with indexes
- ✅ CDN-ready static assets

### Monitoring

Consider adding:

- Error tracking (Sentry)
- Performance monitoring
- Database query optimization
- Log aggregation

## Development

### Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── tracker.js/route.ts    # Tracking script endpoint
│   │   └── track/route.ts         # Event collection endpoint
│   ├── dashboard/
│   │   └── page.tsx               # Dashboard UI
│   ├── layout.tsx
│   └── page.tsx                   # Landing page
├── lib/
│   └── supabase.ts                # Supabase configuration
└── components/                    # Reusable components
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run start` - Start production server
- `npm run lint` - Run ESLint

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details.

## Support

For issues and questions:

1. Check the documentation
2. Search existing issues
3. Create a new issue with detailed information

---

Built with ❤️ using Next.js and Supabase
