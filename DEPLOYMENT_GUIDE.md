# Mekfidel Deployment Guide

This guide covers deploying the Mekfidel website with CMS functionality.

## Prerequisites

- Node.js 18.x or later
- npm or yarn
- Supabase account
- Git

## Environment Setup

### 1. Clone the Repository

```bash
git clone https://github.com/cchughiefe-art/Mekfidel.git
cd Mekfidel
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Environment Variables

Create a `.env.local` file in the project root:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key

# Site URL
NEXT_PUBLIC_SITE_URL=https://your-domain.com

# Optional
NEXT_PUBLIC_GA_ID=your_google_analytics_id
```

### 4. Database Setup

#### Option A: Run Full SQL (Fresh Installation)

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Select your project
3. Navigate to **SQL Editor**
4. Copy the entire contents of `supabase_sql_editor.sql`
5. Click **Run**

#### Option B: Run Migration (Existing Database)

1. Navigate to **SQL Editor**
2. Copy the contents of `sql/cms_migration.sql`
3. Click **Run**

This will create all new CMS tables without affecting existing data.

### 5. Storage Buckets

The SQL includes storage bucket creation. Verify in Supabase:

1. Go to **Storage** in your Supabase project
2. Verify these buckets exist:
   - `logos`
   - `products`
   - `banners`
   - `gallery`
   - `blog`
   - `icons`
   - `uploads`

If buckets don't exist, create them manually with the SQL.

## Deployment Options

### Option 1: Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - `SUPABASE_SERVICE_ROLE_KEY`
   - `NEXT_PUBLIC_SITE_URL`
3. Deploy

### Option 2: Netlify

1. Connect your GitHub repository to Netlify
2. Set build command: `npm run build`
3. Set publish directory: `.next`
4. Add environment variables
5. Deploy

### Option 3: Docker

```dockerfile
FROM node:18-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

FROM node:18-alpine AS runner
WORKDIR /app
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static .next/static
COPY --from=builder /app/public ./public
EXPOSE 3000
CMD ["node", "server.js"]
```

## Supabase Configuration

### Authentication

1. Go to **Authentication** → **Settings**
2. Configure:
   - Site URL: Your production URL
   - Redirect URLs: Add production domain
3. Enable providers as needed (Email, Google, etc.)

### Row Level Security

All CMS tables have RLS enabled by default. Ensure:

1. Profiles table has proper user references
2. Auth trigger creates profile on signup
3. Service role key is kept secure (server-side only)

### API Rate Limits

- Free tier: 60 requests/minute
- Pro tier: Higher limits

Monitor usage in Supabase dashboard.

## Post-Deployment Checklist

### 1. Initial Setup

- [ ] Run database SQL
- [ ] Verify storage buckets
- [ ] Test authentication
- [ ] Create admin user

### 2. CMS Content

- [ ] Add homepage sections
- [ ] Configure navigation
- [ ] Set up footer content
- [ ] Add testimonials
- [ ] Add FAQs
- [ ] Upload icons if needed

### 3. Testing

- [ ] Test homepage loads correctly
- [ ] Test navigation works
- [ ] Test admin pages accessible
- [ ] Test CMS content updates
- [ ] Test public website

### 4. Monitoring

- [ ] Set up error tracking (Sentry recommended)
- [ ] Configure analytics
- [ ] Set up uptime monitoring
- [ ] Review Supabase usage

## Troubleshooting

### Build Fails

```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm cache clean --force
npm install
npm run build
```

### Database Connection Issues

1. Verify environment variables are set
2. Check Supabase URL is correct
3. Ensure anon key has proper permissions
4. Check RLS policies

### CMS Not Working

1. Verify database tables exist
2. Check RLS policies allow access
3. Clear browser cache
4. Check browser console for errors

### Storage Upload Fails

1. Verify storage bucket exists
2. Check file size limits
3. Verify allowed mime types
4. Check bucket policies

## Performance Optimization

### Caching

CMS content uses React Query with caching:
```typescript
staleTime: 5 * 60 * 1000, // 5 minutes
```

Adjust based on update frequency needs.

### Image Optimization

- Use Next.js Image component
- Optimize images before upload
- Use appropriate formats (WebP, AVIF)

### Database Indexes

All CMS tables have indexes for common queries. Don't remove them.

## Security Checklist

- [ ] All environment variables set
- [ ] Service role key not exposed to client
- [ ] RLS policies enabled on all tables
- [ ] Admin accounts have strong passwords
- [ ] HTTPS enabled on production
- [ ] CORS configured properly

## Backup Strategy

### Database Backups

Supabase provides automatic daily backups. For additional safety:

1. Use Supabase CLI for manual exports
2. Schedule pg_dump for custom backup timing
3. Test backup restoration periodically

### Storage Backups

Files in Supabase Storage are not automatically backed up. Consider:
- Third-party backup service
- Manual periodic exports
- Versioning if available

## Support

For deployment issues:
1. Check Supabase status page
2. Review Next.js deployment docs
3. Contact development team
