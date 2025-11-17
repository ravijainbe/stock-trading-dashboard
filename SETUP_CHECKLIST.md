# 📋 Setup Checklist

Use this checklist to ensure everything is configured correctly.

## ✅ Pre-Deployment Checklist

### 1. Kite API Setup
- [ ] Registered at kite.trade
- [ ] Created Kite Connect app
- [ ] Got API Key
- [ ] Got API Secret (keep secure!)
- [ ] Set redirect URL in Kite dashboard

### 2. Supabase Setup
- [ ] Created Supabase project
- [ ] Ran SQL schema (from README.md)
- [ ] Got Supabase URL
- [ ] Got Supabase anon key
- [ ] Enabled Row Level Security

### 3. Backend Configuration
- [ ] Installed Node.js dependencies (`npm install`)
- [ ] Created `.env` file from `.env.example`
- [ ] Added KITE_API_KEY to `.env`
- [ ] Added KITE_API_SECRET to `.env`
- [ ] Generated ENCRYPTION_KEY
- [ ] Set PORT (default: 3000)
- [ ] Set FRONTEND_URL
- [ ] Tested backend (`npm start`)

### 4. Frontend Configuration
- [ ] Updated Supabase URL in `auth.js`
- [ ] Updated Supabase key in `auth.js`
- [ ] Updated Supabase URL in `cloud-db.js`
- [ ] Updated Supabase key in `cloud-db.js`
- [ ] Updated backend URL in `kite-client.js` (for production)
- [ ] Tested frontend locally

### 5. Security Check
- [ ] `.env` file is in `.gitignore`
- [ ] No credentials in code
- [ ] API Secret not exposed
- [ ] Strong encryption key generated
- [ ] CORS configured correctly

### 6. Testing
- [ ] Can sign up
- [ ] Can log in
- [ ] Can add manual trade
- [ ] Can view portfolio
- [ ] Can connect to Kite
- [ ] Can sync trades from Kite
- [ ] Can export data
- [ ] Works on mobile

### 7. Deployment
- [ ] Backend deployed (Heroku/Railway/VPS)
- [ ] Frontend deployed (GitHub Pages/Netlify)
- [ ] Environment variables set on hosting
- [ ] Updated Kite redirect URL to production URL
- [ ] Updated backend URL in frontend
- [ ] Tested production deployment
- [ ] HTTPS enabled

### 8. Post-Deployment
- [ ] Created first user account
- [ ] Connected Kite successfully
- [ ] Imported trades
- [ ] Verified portfolio calculations
- [ ] Tested on Android device
- [ ] Installed as PWA

## 🚨 Common Issues

### Backend won't start
- Check `.env` file exists
- Verify all environment variables are set
- Check Node.js version (16+)

### Can't connect to Kite
- Verify API credentials are correct
- Check redirect URL matches exactly
- Ensure backend is running

### Database errors
- Run SQL schema in Supabase
- Check RLS policies are enabled
- Verify credentials in frontend

### CORS errors
- Update FRONTEND_URL in backend `.env`
- Restart backend server
- Check browser console for exact error

## 📞 Support

If you encounter issues:
1. Check this checklist
2. Review error messages
3. Check browser console (F12)
4. Check backend logs
5. Refer to KITE_SETUP_GUIDE.md

## 🎉 Success Criteria

Your setup is complete when:
- ✅ You can log in
- ✅ Kite connection works
- ✅ Trades sync automatically
- ✅ Portfolio shows correct P&L
- ✅ App works on mobile
- ✅ Data persists after refresh

**Congratulations! Your Stock Trading Dashboard is ready! 🚀**
