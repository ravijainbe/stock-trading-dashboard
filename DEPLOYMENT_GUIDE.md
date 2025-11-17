# 🚀 Complete Deployment Guide

Deploy your Stock Trading Dashboard to production in 30 minutes!

---

## 📋 Pre-Deployment Checklist

Before deploying, make sure you have:

- [ ] Kite API Key and Secret
- [ ] Supabase project setup with tables
- [ ] GitHub account
- [ ] Heroku or Railway account (for backend)
- [ ] All credentials ready

---

## Part 1: Deploy Backend to Heroku

### Option A: Deploy to Heroku (Recommended)

#### Step 1: Install Heroku CLI

**Windows:**
Download from: https://devcenter.heroku.com/articles/heroku-cli

**Mac:**
```bash
brew tap heroku/brew && brew install heroku
```

**Linux:**
```bash
curl https://cli-assets.heroku.com/install.sh | sh
```

#### Step 2: Login to Heroku

```bash
heroku login
```

#### Step 3: Prepare Backend for Deployment

```bash
cd stock-trading-dashboard/backend

# Initialize git (if not already)
git init
git add .
git commit -m "Initial backend commit"
```

#### Step 4: Create Heroku App

```bash
# Create app (choose a unique name)
heroku create your-stock-backend

# Or let Heroku generate a name
heroku create
```

**Note the app URL:** `https://your-stock-backend.herokuapp.com`

#### Step 5: Set Environment Variables

```bash
heroku config:set KITE_API_KEY=your_kite_api_key
heroku config:set KITE_API_SECRET=your_kite_api_secret
heroku config:set ENCRYPTION_KEY=$(node -e "console.log(require('crypto').randomBytes(16).toString('hex'))")
heroku config:set FRONTEND_URL=https://yourusername.github.io/stock-trading-dashboard
heroku config:set PORT=3000
```

#### Step 6: Deploy to Heroku

```bash
git push heroku main
```

Or if your branch is named differently:
```bash
git push heroku master
```

#### Step 7: Verify Deployment

```bash
# Check logs
heroku logs --tail

# Open in browser
heroku open
```

Visit: `https://your-stock-backend.herokuapp.com/health`

You should see: `{"status":"ok","message":"Server is running"}`

✅ **Backend deployed successfully!**

---

### Option B: Deploy to Railway (Alternative)

#### Step 1: Install Railway CLI

```bash
npm install -g @railway/cli
```

#### Step 2: Login

```bash
railway login
```

#### Step 3: Initialize Project

```bash
cd stock-trading-dashboard/backend
railway init
```

#### Step 4: Set Environment Variables

```bash
railway variables set KITE_API_KEY=your_key
railway variables set KITE_API_SECRET=your_secret
railway variables set ENCRYPTION_KEY=your_key
railway variables set FRONTEND_URL=https://yourusername.github.io/stock-trading-dashboard
```

#### Step 5: Deploy

```bash
railway up
```

#### Step 6: Get URL

```bash
railway domain
```

✅ **Backend deployed to Railway!**

---

## Part 2: Deploy Frontend to GitHub Pages

### Step 1: Update Backend URL

Edit `stock-trading-dashboard/kite-client.js`:

```javascript
// Change this line:
this.backendUrl = 'http://localhost:3000';

// To your Heroku URL:
this.backendUrl = 'https://your-stock-backend.herokuapp.com';
```

### Step 2: Update Supabase Credentials

Edit `stock-trading-dashboard/auth.js`:

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

Edit `stock-trading-dashboard/cloud-db.js`:

```javascript
this.supabaseUrl = 'YOUR_SUPABASE_URL';
this.supabaseKey = 'YOUR_SUPABASE_ANON_KEY';
```

### Step 3: Create GitHub Repository

```bash
cd stock-trading-dashboard

# Initialize git
git init

# Add all files
git add .

# Commit
git commit -m "Stock Trading Dashboard - Initial commit"

# Create repo on GitHub (via web or CLI)
# Then add remote
git remote add origin https://github.com/yourusername/stock-trading-dashboard.git

# Push to GitHub
git branch -M main
git push -u origin main
```

### Step 4: Enable GitHub Pages

1. Go to your repository on GitHub
2. Click **Settings**
3. Scroll to **Pages** section (left sidebar)
4. Under **Source**:
   - Branch: `main`
   - Folder: `/ (root)`
5. Click **Save**

### Step 5: Wait for Deployment

GitHub will deploy your site. Wait 2-3 minutes.

Your site will be available at:
`https://yourusername.github.io/stock-trading-dashboard/`

✅ **Frontend deployed to GitHub Pages!**

---

## Part 3: Update Kite Redirect URL

### Step 1: Login to Kite Developer Console

Go to: https://developers.kite.trade/apps

### Step 2: Edit Your App

1. Click on your app
2. Click **Edit**
3. Update **Redirect URL** to:
   ```
   https://yourusername.github.io/stock-trading-dashboard/
   ```
4. Click **Update**

✅ **Kite redirect URL updated!**

---

## Part 4: Update Backend CORS

### Update Frontend URL in Heroku

```bash
heroku config:set FRONTEND_URL=https://yourusername.github.io/stock-trading-dashboard
```

Or in Railway:
```bash
railway variables set FRONTEND_URL=https://yourusername.github.io/stock-trading-dashboard
```

---

## Part 5: Test Your Deployed App

### Step 1: Open Your App

Visit: `https://yourusername.github.io/stock-trading-dashboard/`

### Step 2: Create Account

1. Click **Sign Up**
2. Enter your details
3. Choose role (Admin for multi-profile)
4. Sign up

### Step 3: Connect Kite

1. Go to **Settings**
2. Click **Connect Kite**
3. Login to Zerodha
4. Authorize the app
5. You'll be redirected back

### Step 4: Sync Trades

1. Click **Sync** button in header
2. Wait for trades to import
3. Check **Portfolio** view

✅ **Everything is working!**

---

## Part 6: Custom Domain (Optional)

### For Frontend (GitHub Pages)

1. Buy a domain (e.g., from Namecheap, GoDaddy)
2. Add CNAME record pointing to: `yourusername.github.io`
3. In GitHub repo settings → Pages → Custom domain
4. Enter your domain
5. Enable **Enforce HTTPS**

### For Backend (Heroku)

```bash
heroku domains:add api.yourdomain.com
```

Then add DNS record as instructed.

---

## Troubleshooting

### Backend Issues

**Error: Application error**
```bash
# Check logs
heroku logs --tail

# Common fixes:
# 1. Verify environment variables
heroku config

# 2. Restart dyno
heroku restart
```

**Error: H10 App crashed**
- Check if all dependencies are in package.json
- Verify PORT is set correctly
- Check logs for errors

### Frontend Issues

**404 Not Found**
- Wait 2-3 minutes after enabling Pages
- Check branch and folder settings
- Verify index.html is in root

**CORS Errors**
- Update FRONTEND_URL in backend
- Restart backend
- Clear browser cache

**Kite Connection Fails**
- Verify redirect URL in Kite dashboard
- Check backend URL in kite-client.js
- Ensure backend is running

### Database Issues

**Can't save data**
- Check Supabase credentials
- Verify RLS policies are set
- Check browser console for errors

---

## Monitoring & Maintenance

### Check Backend Health

```bash
# Heroku
heroku logs --tail

# Railway
railway logs
```

### Update Backend

```bash
cd backend
git add .
git commit -m "Update message"
git push heroku main
```

### Update Frontend

```bash
cd stock-trading-dashboard
git add .
git commit -m "Update message"
git push origin main
```

GitHub Pages will auto-deploy in 2-3 minutes.

---

## Cost Summary

### Monthly Costs

- **Kite Connect API**: ₹2,000/month
- **Heroku Eco Dyno**: $5/month (~₹400)
- **Supabase**: Free (up to 500MB)
- **GitHub Pages**: Free
- **Domain** (optional): ₹500-1000/year

**Total: ₹2,400-2,500/month**

### Free Tier Limits

**Heroku Free Tier (Deprecated):**
- Use Eco Dyno ($5/month) instead

**Railway Free Tier:**
- $5 credit/month
- Good for light usage

**Supabase Free Tier:**
- 500MB database
- 2GB bandwidth
- 50,000 monthly active users

---

## Security Checklist

- [ ] HTTPS enabled on both frontend and backend
- [ ] Environment variables set (not hardcoded)
- [ ] API Secret never exposed to frontend
- [ ] CORS configured correctly
- [ ] Supabase RLS policies enabled
- [ ] Strong encryption key used
- [ ] .env file in .gitignore
- [ ] Regular security updates

---

## Backup Strategy

### Database Backup

Supabase provides automatic backups. To manual backup:

1. Go to Supabase Dashboard
2. Database → Backups
3. Download backup

### Code Backup

Your code is on GitHub - already backed up!

### User Data Export

Users can export their data from Settings → Export Data

---

## Next Steps

1. ✅ Deploy backend
2. ✅ Deploy frontend
3. ✅ Update configurations
4. ✅ Test thoroughly
5. 📊 Add analytics (Google Analytics)
6. 📱 Test on mobile devices
7. 🎨 Customize branding
8. 📈 Monitor usage
9. 🔄 Regular updates
10. 💬 Gather user feedback

---

## Support & Resources

- **Heroku Docs**: https://devcenter.heroku.com/
- **GitHub Pages**: https://pages.github.com/
- **Kite API**: https://kite.trade/docs/connect/v3/
- **Supabase**: https://supabase.com/docs

---

## 🎉 Congratulations!

Your Stock Trading Dashboard is now live and accessible from anywhere!

**Your URLs:**
- Frontend: `https://yourusername.github.io/stock-trading-dashboard/`
- Backend: `https://your-stock-backend.herokuapp.com`

**Share with friends and start tracking your portfolio! 📈**
