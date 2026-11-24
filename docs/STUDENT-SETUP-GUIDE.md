# 🎓 Student Development Setup Guide ($5 Budget)

**Welcome!** This guide will help you set up Pixray Cloud Gaming for local development **WITHOUT spending money**.

## 🚨 Important: Cost-Free Development Mode

With your $5 budget, we'll use **MOCK MODE** during development:
- ✅ No AWS EC2 instances launched
- ✅ No AWS costs incurred
- ✅ Test all features locally
- ✅ Only pay when deploying to production

---

## Step 1: Prerequisites (FREE)

### 1.1 Install Required Software

**Already Installed:**
- ✅ Node.js 18+ (you have this)
- ✅ npm (you have this)
- ✅ Git (you have this)

**Need to Create (FREE Accounts):**
- [ ] Supabase account (database)
- [ ] Stripe account (test mode only)

---

## Step 2: Set Up Supabase (FREE - No Credit Card Required)

### 2.1 Create Supabase Project

1. Go to [https://supabase.com](https://supabase.com)
2. Click **"Start your project"**
3. Sign up with GitHub (fastest)
4. Click **"New Project"**
5. Fill in:
   - **Name**: `pixray-cloud-dev`
   - **Database Password**: (save this!)
   - **Region**: Choose closest to you
   - **Pricing Plan**: **FREE** (stays free forever)
6. Click **"Create new project"**
7. Wait 2-3 minutes for setup

### 2.2 Get Supabase Keys

1. In your Supabase dashboard, click **"Settings"** (gear icon)
2. Click **"API"**
3. Copy these values:
   - **Project URL** → Save as `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key → Save as `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** key (click reveal) → Save as `SUPABASE_SERVICE_ROLE_KEY`

### 2.3 Run Database Migrations

1. In Supabase dashboard, click **"SQL Editor"**
2. Click **"New Query"**

3. **First Migration** - Copy all content from:
   ```
   supabase/migrations/000_base_tables.sql
   ```
   Paste and click **RUN** ▶️

4. **Second Migration** - Copy all content from:
   ```
   supabase/migrations/001_gaming_sessions_schema.sql
   ```
   Paste and click **RUN** ▶️

5. **Add Sample Games** - Copy all content from:
   ```
   supabase/migrations/002_sample_games.sql
   ```
   Paste and click **RUN** ▶️

✅ **Done!** Your database is ready.

---

## Step 3: Set Up Stripe (FREE - Test Mode)

### 3.1 Create Stripe Account

1. Go to [https://stripe.com](https://stripe.com)
2. Click **"Start now"**
3. Sign up (FREE, no credit card needed for test mode)
4. Skip business verification (use test mode)

### 3.2 Get Stripe Test Keys

1. In Stripe dashboard, click **"Developers"**
2. Click **"API keys"**
3. Make sure **"Test mode"** toggle is ON (top right)
4. Copy these values:
   - **Publishable key** → Save as `STRIPE_PUBLISHABLE_KEY`
   - **Secret key** (click reveal) → Save as `STRIPE_SECRET_KEY`

✅ **Done!** Stripe is ready (test mode, no real money).

---

## Step 4: Configure Your Project

### 4.1 Create .env.local File

1. Open terminal in project directory
2. Copy the template:
   ```bash
   cp .env.local .env.local.backup
   ```

3. Edit `.env.local` and replace these values:

```bash
# =============================================================================
# REQUIRED: Supabase (from Step 2.2)
# =============================================================================
NEXT_PUBLIC_SUPABASE_URL=https://your-project-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here

# =============================================================================
# REQUIRED: Stripe Test Keys (from Step 3.2)
# =============================================================================
STRIPE_SECRET_KEY=sk_test_your_test_key_here
STRIPE_PUBLISHABLE_KEY=pk_test_your_test_key_here

# =============================================================================
# OPTIONAL: Keep these as-is for development
# =============================================================================
ENABLE_MOCK_MODE=true
NODE_ENV=development
NEXT_PUBLIC_APP_URL=http://localhost:3000
WINDOWS_AMI_ID=ami-mock-development-12345
HOURLY_CREDIT_RATE=1
```

### 4.2 What Each Setting Does

- **`ENABLE_MOCK_MODE=true`** → No AWS costs, simulated instances
- **`WINDOWS_AMI_ID=ami-mock-development-12345`** → Fake AMI ID for dev
- **`HOURLY_CREDIT_RATE=1`** → Cheap credits for testing (1 credit/hour)

---

## Step 5: Install Dependencies

```bash
# Make sure you're in the project directory
cd /home/user/pixray-cloud

# Install all packages
npm install
```

This takes 1-2 minutes.

---

## Step 6: Start Development Server

```bash
npm run dev
```

You should see:
```
ready - started server on 0.0.0.0:3000, url: http://localhost:3000
🧪 MOCK MODE ENABLED - No AWS costs will be incurred
```

**If you see this, you're safe!** 🎉

---

## Step 7: Test the Application

### 7.1 Create an Account

1. Open browser: [http://localhost:3000](http://localhost:3000)
2. Click **"Sign Up"**
3. Enter email and password
4. Verify email (check inbox/spam)
5. Log in

### 7.2 Test Mock Gaming Session

1. Go to **Dashboard**
2. You should see 5 sample games
3. Click **"Play Now"** on any game

**What happens:**
- ✅ Modal opens showing "Launching instance..."
- ✅ Progress bar animates
- ✅ After ~5 seconds: QR code appears
- ✅ You get a mock pairing code
- ✅ **NO AWS COSTS** - it's all simulated!

You should see in terminal:
```
[MOCK EC2] Simulating instance launch...
[SessionBroker] Launching MOCK instance...
🧪 MOCK MODE ENABLED
```

### 7.3 Test Payment Flow

1. Click **"Upgrade"** or try to play when out of credits
2. Select a credit package
3. Use Stripe test card:
   - Card: `4242 4242 4242 4242`
   - Expiry: Any future date
   - CVC: Any 3 digits
   - ZIP: Any 5 digits
4. Complete "payment"
5. Credits should be added

**This is FREE - it's test mode!**

---

## Step 8: Understanding Mock Mode

### What Mock Mode Does

| Feature | Mock Mode | Real AWS |
|---------|-----------|----------|
| Instance Launch | ✅ Simulated | ❌ Costs $ |
| Pairing Code | ✅ Generated | ✅ Generated |
| QR Code | ✅ Created | ✅ Created |
| Public IP | ✅ Fake (192.0.2.x) | ❌ Real IP |
| Moonlight Connection | ❌ Won't work | ✅ Works |
| Development Testing | ✅ Perfect | ❌ Expensive |

### When Mock Mode is Active

You'll see these logs:
```
🧪 MOCK MODE ENABLED - No AWS costs will be incurred
[MOCK EC2] Simulating instance launch...
[MOCK EC2] Mock instance launched: i-mock...
```

---

## Step 9: Cost Safety Checklist

Before **EVER** deploying to AWS:

- [ ] Confirm `ENABLE_MOCK_MODE=true` in `.env.local`
- [ ] Verify no `AWS_ACCESS_KEY_ID` in environment
- [ ] Check terminal for "MOCK MODE ENABLED" message
- [ ] Test locally first with mock mode
- [ ] Set AWS billing alerts (if you get AWS account)

---

## Step 10: When You're Ready for Real AWS (Later)

### AWS Free Tier Benefits

AWS offers **12 months FREE** for students:
- 750 hours/month EC2 t2.micro (FREE)
- But g4dn.xlarge (GPU) = **$0.526/hour** (NOT FREE)

### Cost Calculation

**GPU Instance Costs:**
- g4dn.xlarge = $0.526/hour = **~$0.009/minute**
- 1 hour testing = **$0.53**
- 10 hours = **$5.26** (your whole budget!)

### Recommended: AWS Educate

1. Sign up for [AWS Educate](https://aws.amazon.com/education/awseducate/)
2. Get **$50-100 FREE credits** for students
3. Use your `.edu` email
4. Takes 1-2 days for approval

---

## Troubleshooting

### Error: "Failed to create session"

**Solution:** Make sure `.env.local` has:
```bash
ENABLE_MOCK_MODE=true
WINDOWS_AMI_ID=ami-mock-development-12345
```

### Error: "relation 'users' does not exist"

**Solution:** Run database migrations (Step 2.3)

### No games showing

**Solution:** Run `002_sample_games.sql` migration

### Port 3000 already in use

**Solution:**
```bash
# Kill the process
npx kill-port 3000

# Or use different port
PORT=3001 npm run dev
```

---

## What You Can Test (FREE)

✅ **User registration and login**
✅ **Dashboard UI**
✅ **Game catalog**
✅ **Session creation flow** (mock)
✅ **QR code generation**
✅ **Pairing code display**
✅ **Credit system**
✅ **Payment flow** (Stripe test mode)
✅ **Session termination**
✅ **All frontend features**

---

## What You CANNOT Test Without AWS

❌ **Real EC2 instance launch**
❌ **Actual Sunshine server**
❌ **Real Moonlight connection**
❌ **GPU encoding**
❌ **Actual game streaming**

**But that's OK!** 90% of development can happen in mock mode.

---

## Next Steps

1. ✅ Follow this guide
2. ✅ Test in mock mode
3. ✅ Build features and UI
4. 📚 Apply for AWS Educate (optional)
5. 🚀 Deploy when ready (with free credits)

---

## Need Help?

**Common Questions:**

**Q: Will this actually cost me money?**
A: No! As long as `ENABLE_MOCK_MODE=true`, everything is simulated.

**Q: Can I test Moonlight pairing?**
A: Not in mock mode. You need real AWS for that.

**Q: How do I know I'm safe?**
A: Look for "🧪 MOCK MODE ENABLED" in terminal.

**Q: When should I use real AWS?**
A: After AWS Educate approval with $50-100 free credits.

---

## Summary

You now have a **fully functional development environment** with:

- ✅ Zero AWS costs
- ✅ Full UI testing
- ✅ Payment testing (Stripe test mode)
- ✅ Database integration
- ✅ All features except actual game streaming

**This is perfect for learning, developing, and building your project!**

🎉 **Happy Coding!**
