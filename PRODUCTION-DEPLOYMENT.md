# 🚀 Production Deployment Guide

## CORS Configuration for Production

### 1. Update Allowed Origins

In `src/app/api/track/route.ts`, update the `allowedOrigins` array:

```typescript
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? [
        "https://yourdomain.com",
        "https://www.yourdomain.com",
        "https://client1.com",
        "https://client2.com",
        // Add all domains that will embed your tracking script
      ]
    : ["*"];
```

### 2. Environment Variables

Create a `.env.production` file:

```env
NODE_ENV=production
NEXT_PUBLIC_SUPABASE_URL=your-supabase-url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
```

### 3. Deploy to Vercel (Recommended)

1. **Connect to Vercel:**

   ```bash
   npm i -g vercel
   vercel login
   vercel
   ```

2. **Set Environment Variables:**

   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add all your environment variables

3. **Deploy:**
   ```bash
   vercel --prod
   ```

### 4. Alternative: Deploy to Any Hosting

1. **Build the app:**

   ```bash
   npm run build
   ```

2. **Start production server:**
   ```bash
   npm start
   ```

### 5. Update CORS for Your Domain

After deployment, update the CORS configuration with your actual domain:

```typescript
const allowedOrigins =
  process.env.NODE_ENV === "production"
    ? ["https://your-actual-domain.com", "https://www.your-actual-domain.com"]
    : ["*"];
```

## 🔒 Security Considerations

### 1. Rate Limiting

Consider adding rate limiting to prevent abuse:

```typescript
// Add to your API route
const rateLimit = new Map();

export async function POST(request: NextRequest) {
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const now = Date.now();
  const windowMs = 60000; // 1 minute
  const maxRequests = 100; // 100 requests per minute per IP

  if (!rateLimit.has(ip)) {
    rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
  } else {
    const data = rateLimit.get(ip);
    if (now > data.resetTime) {
      rateLimit.set(ip, { count: 1, resetTime: now + windowMs });
    } else if (data.count >= maxRequests) {
      return NextResponse.json(
        { error: "Rate limit exceeded" },
        { status: 429 }
      );
    } else {
      data.count++;
    }
  }

  // ... rest of your code
}
```

### 2. Input Validation

The current implementation already includes Zod validation, but you can add more:

```typescript
const trackEventSchema = z.object({
  trackerId: z
    .string()
    .min(8)
    .max(64)
    .regex(/^[a-zA-Z0-9]+$/),
  scrollDepth: z.number().min(0).max(100),
  pageUrl: z.string().url().max(2048),
  timestamp: z.number().int().positive(),
  // ... rest of schema
});
```

### 3. Database Security

- Ensure Row Level Security (RLS) is enabled on all tables
- Use service role key only on the server side
- Never expose service role key to the client

## 📊 Monitoring

### 1. Add Logging

```typescript
console.log(`Track event: ${trackerId} - ${scrollDepth}% - ${pageUrl}`);
```

### 2. Error Tracking

Consider integrating with Sentry or similar service:

```bash
npm install @sentry/nextjs
```

### 3. Analytics

Track your own usage:

- Number of active trackers
- API request volume
- Error rates

## 🌐 CDN Configuration

If using a CDN (Cloudflare, etc.), ensure:

- CORS headers are properly forwarded
- Cache settings don't interfere with real-time tracking
- SSL/TLS is properly configured

## ✅ Testing Checklist

Before going live:

- [ ] Test tracking script on different domains
- [ ] Verify CORS works with your production domain
- [ ] Test rate limiting
- [ ] Verify database connections
- [ ] Test error handling
- [ ] Check SSL certificate
- [ ] Test on mobile devices
- [ ] Verify engagement metrics are working

## 🚨 Common Issues

### CORS Still Not Working?

1. Check if your domain is in the `allowedOrigins` array
2. Verify the domain matches exactly (including https://)
3. Check browser developer tools for preflight request errors
4. Ensure your hosting provider supports CORS headers

### Engagement Metrics Not Showing?

1. Check if the tracking script is sending engagement data
2. Verify the database migration was run
3. Check browser console for JavaScript errors
4. Ensure the script is loaded properly

### High Server Load?

1. Implement rate limiting
2. Add request caching
3. Optimize database queries
4. Consider using a CDN for the tracking script
