# Metadata Debugging Guide

## Overview
This document provides information about debugging metadata generation in the portfolio application.

## Key Findings

### 1. Metadata Implementation
- **Dynamic Metadata**: Projects and columns use `generateMetadata` functions for dynamic metadata generation
- **ISR (Incremental Static Regeneration)**: Pages use `revalidate = 60` for 60-second cache
- **Static Generation**: Pages use `generateStaticParams` for pre-generating static paths

### 2. Potential Issues

#### a. Middleware Interference
The middleware at `/middleware.ts` processes all requests and might affect metadata generation:
```typescript
export const config = {
  matcher: [
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
```

#### b. Supabase Client Usage
- Static pages use `createStaticClient()` for data fetching
- This ensures consistent data fetching during build time

#### c. Image URL Construction
Project metadata constructs image URLs with fallbacks:
```typescript
if (project.thumbnail.startsWith('http')) {
  imageUrl = project.thumbnail
} else if (project.thumbnail.startsWith('/')) {
  imageUrl = `${baseUrl}${project.thumbnail}`
} else {
  imageUrl = project.thumbnail
}
```

### 3. Debug Tools Created

#### a. Metadata Debug Page
**Location**: `/app/admin/debug/metadata/page.tsx`
**Access**: Admin panel → メタデータデバッグ

Features:
- Test any URL's metadata
- View Open Graph tags
- View Twitter Card tags
- Check Next.js metadata
- View response headers

#### b. API Debug Endpoints

1. **Metadata Fetcher**: `/api/debug/metadata`
   - Fetches and parses metadata from any URL
   - Returns structured metadata information

2. **Server-side Metadata Checker**: `/api/debug/check-metadata`
   - Tests metadata generation on the server
   - Accepts `type` (project/column) and `id` parameters
   - Returns generated metadata and environment info

## How to Debug Metadata Issues

### 1. Check Production Metadata
```bash
# Test a project page
curl "https://www.landbridge.ai/api/debug/check-metadata?type=project&id=YOUR_PROJECT_ID"

# Test a column page
curl "https://www.landbridge.ai/api/debug/check-metadata?type=column&id=YOUR_COLUMN_SLUG"
```

### 2. Use the Admin Debug Tool
1. Login to admin panel
2. Navigate to "メタデータデバッグ"
3. Enter the production URL
4. Check if metadata is correctly generated

### 3. Common Issues to Check

1. **Cache Headers**: Look for aggressive caching that might prevent metadata updates
2. **Build Errors**: Check build logs for metadata generation errors
3. **Data Fetching**: Ensure Supabase queries return data during build
4. **Image URLs**: Verify image URLs are absolute and accessible
5. **Environment Variables**: Ensure all required env vars are set in production

### 4. Verification Steps

1. **Local Testing**:
   ```bash
   npm run build
   npm run start
   # Visit http://localhost:3000/projects/[id]
   # Check page source for meta tags
   ```

2. **Production Testing**:
   - Use social media debuggers:
     - Facebook: https://developers.facebook.com/tools/debug/
     - Twitter: https://cards-dev.twitter.com/validator
     - LinkedIn: https://www.linkedin.com/post-inspector/

3. **Check Response Headers**:
   ```bash
   curl -I https://www.landbridge.ai/projects/[id]
   ```

### 5. Troubleshooting Checklist

- [ ] Metadata appears in page source?
- [ ] Open Graph tags present?
- [ ] Twitter Card tags present?
- [ ] Images load correctly?
- [ ] No console errors during build?
- [ ] ISR revalidation working?
- [ ] Middleware not blocking metadata?
- [ ] Environment variables set correctly?

## Next Steps

If metadata issues persist:
1. Check Vercel deployment logs
2. Test with `export const dynamic = 'force-dynamic'` temporarily
3. Review Next.js metadata documentation
4. Check for any custom headers in `next.config.js`