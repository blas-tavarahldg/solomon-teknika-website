# Solomon Teknika — Deployment Guide

Complete instructions for deploying Solomon Teknika to production.

## Pre-Deployment Checklist

- [ ] All environment variables configured
- [ ] Build completes without errors (`npm run build`)
- [ ] No console errors or warnings in development
- [ ] All pages accessible and functional
- [ ] Links verified (internal and external)
- [ ] Contact form tested
- [ ] Mobile responsive design verified
- [ ] Images and assets loading correctly

## Vercel Deployment (Recommended)

### Step 1: Prepare Repository

```bash
# Ensure all changes are committed
git status
git add .
git commit -m "Ready for production deployment"
```

### Step 2: Connect to Vercel

```bash
# Option A: Via CLI
npm install -g vercel
vercel

# Option B: Via Vercel Dashboard
# 1. Go to https://vercel.com/new
# 2. Connect your GitHub account
# 3. Select the Solomon Teknika repository
# 4. Click "Import"
```

### Step 3: Configure Build Settings

Vercel should auto-detect Next.js configuration. Verify:

- **Framework**: Next.js
- **Build Command**: `npm run build`
- **Output Directory**: `.next`
- **Install Command**: `npm install`

### Step 4: Set Environment Variables

In Vercel dashboard, go to **Settings > Environment Variables**:

```
NEXT_PUBLIC_SITE_URL=https://solomonteknicks.com
CONTACT_EMAIL=blas@tavaraholdings.com
```

### Step 5: Deploy

```bash
vercel --prod
```

Or use Vercel dashboard "Deploy" button.

### Step 6: Verify Deployment

1. Check deployment status in Vercel dashboard
2. Visit your live URL
3. Test all pages and forms
4. Verify analytics are working

## Custom Domain

### Using Vercel Domains

1. In Vercel dashboard: **Settings > Domains**
2. Click "Add"
3. Enter your domain: `solomonteknicks.com`
4. Follow DNS instructions

### Using External Domain Registrar

1. Purchase domain from registrar (GoDaddy, Namecheap, etc.)
2. In registrar, update DNS to:
   - Type: CNAME
   - Name: @ (or leave blank)
   - Value: `cname.vercel.com`
3. In Vercel, add domain in **Settings > Domains**

## SSL/TLS Certificate

Vercel automatically issues free SSL certificates. No action needed.

## Performance Optimization

### Monitor Metrics

Use Vercel Analytics (dashboard → Analytics):
- First Contentful Paint (FCP)
- Largest Contentful Paint (LCP)
- Cumulative Layout Shift (CLS)

### Optimize if Needed

- Reduce image sizes
- Minimize JavaScript
- Use CDN for static assets
- Enable caching headers

## Monitoring & Maintenance

### Daily Checks

- Vercel deployment status
- Error logs (Vercel dashboard → Functions)
- Website accessibility (manual or automated)

### Weekly Checks

- Analytics review
- Performance metrics
- Contact form submissions

### Monthly Checks

- SEO ranking (search console)
- User engagement metrics
- Competitor monitoring

## Email Integration (Optional)

### For Contact Form Emails

#### Option 1: SendGrid (Recommended)

1. Create account at https://sendgrid.com
2. Get API key
3. Set in Vercel environment variables:
   ```
   SENDGRID_API_KEY=your_key
   ```
4. Update `src/app/api/contact/route.ts`:
   ```typescript
   import sgMail from '@sendgrid/mail';
   sgMail.setApiKey(process.env.SENDGRID_API_KEY!);

   await sgMail.send({
     to: process.env.CONTACT_EMAIL,
     from: 'noreply@solomonteknics.com',
     subject: `New contact: ${body.subject}`,
     html: `<p>${body.message}</p>`,
   });
   ```

#### Option 2: Mailgun

1. Create account at https://mailgun.com
2. Get API key and domain
3. Set environment variables
4. Update contact route similarly

#### Option 3: Serverless Email

Use services like:
- Resend (Next.js optimized)
- PostMark
- AWS SES

## Rollback Procedure

If you need to revert to a previous version:

```bash
# In Vercel dashboard:
# 1. Go to Deployments
# 2. Find the previous stable deployment
# 3. Click three dots → "Promote to Production"
```

## Troubleshooting

### Build Fails

```bash
# Clear cache and rebuild
vercel --prod --skip-build-and-cache
```

### Pages Not Loading

1. Check Vercel function logs
2. Verify environment variables
3. Check network tab in browser DevTools

### Contact Form Not Working

1. Check browser console for errors
2. Verify API route is deployed
3. Check email service integration

### SEO Issues

1. Verify `sitemap.xml` (can be auto-generated)
2. Check robots.txt (auto-created by Next.js)
3. Submit to Google Search Console

## Backup & Recovery

### Code Backup

- GitHub automatically backs up code
- Enable GitHub Actions for CI/CD
- Tag releases: `git tag v1.0.0`

### Database Backup

Not applicable (static site). Content versioned in GitHub.

## Performance Benchmarks

Target metrics:

| Metric | Target | Status |
|--------|--------|--------|
| LCP | < 2.5s | ✓ |
| FCP | < 1.8s | ✓ |
| CLS | < 0.1 | ✓ |
| Performance Score | > 90 | ✓ |

## Security

### SSL/TLS
- Enabled automatically by Vercel
- Renews automatically

### DDoS Protection
- Vercel provides built-in protection
- No additional configuration needed

### Security Headers
- Consider adding in `vercel.json`:
  ```json
  {
    "headers": [
      {
        "source": "/(.*)",
        "headers": [
          { "key": "X-Content-Type-Options", "value": "nosniff" },
          { "key": "X-Frame-Options", "value": "SAMEORIGIN" }
        ]
      }
    ]
  }
  ```

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Next.js Docs**: https://nextjs.org/docs
- **Tailwind Docs**: https://tailwindcss.com/docs

---

**Deployment Version**: 1.0.0
**Last Updated**: March 2026
