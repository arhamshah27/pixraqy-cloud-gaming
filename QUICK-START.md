# ⚡ Quick Start (5 Minutes)

**For students with $5 budget** - Follow these steps to start developing WITHOUT AWS costs.

## ✅ Immediate Steps

### 1. Create Supabase Account (2 minutes)

1. Go to [supabase.com](https://supabase.com) → Sign up FREE
2. Create new project: `pixray-cloud-dev`
3. Copy 3 keys from Settings → API:
   - Project URL
   - anon public key
   - service_role key

### 2. Create Stripe Account (2 minutes)

1. Go to [stripe.com](https://stripe.com) → Sign up FREE
2. Enable **Test Mode** (toggle top right)
3. Go to Developers → API keys
4. Copy 2 test keys:
   - Publishable key (pk_test_...)
   - Secret key (sk_test_...)

### 3. Configure Project (1 minute)

```bash
# Copy template
cp .env.local.example .env.local

# Edit .env.local and replace ONLY these lines:
NEXT_PUBLIC_SUPABASE_URL=paste_your_url_here
NEXT_PUBLIC_SUPABASE_ANON_KEY=paste_your_anon_key_here
SUPABASE_SERVICE_ROLE_KEY=paste_your_service_role_key_here
STRIPE_SECRET_KEY=paste_your_sk_test_key_here
STRIPE_PUBLISHABLE_KEY=paste_your_pk_test_key_here

# Keep these as-is (for mock mode):
ENABLE_MOCK_MODE=true
WINDOWS_AMI_ID=ami-mock-development-12345
```

### 4. Run Database Migrations

1. Open Supabase dashboard → SQL Editor
2. Run in order:
   - `supabase/migrations/000_base_tables.sql`
   - `supabase/migrations/001_gaming_sessions_schema.sql`
   - `supabase/migrations/002_sample_games.sql`

### 5. Start Development

```bash
npm install
npm run dev
```

**Look for this in terminal:**
```
🧪 MOCK MODE ENABLED - No AWS costs will be incurred
```

### 6. Test It!

1. Open [http://localhost:3000](http://localhost:3000)
2. Sign up → Create account
3. Go to Dashboard
4. Click **Play Now** on any game
5. Watch mock instance launch (5 seconds)
6. See QR code and pairing code

**All FREE! No AWS costs!** 🎉

---

## 🆘 Stuck?

**Error: "Failed to create session"**
→ Check `.env.local` has `ENABLE_MOCK_MODE=true`

**Error: "relation 'users' does not exist"**
→ Run database migrations (Step 4)

**No games showing**
→ Run `002_sample_games.sql`

---

## 📚 Full Guide

For detailed explanations, read:
**`docs/STUDENT-SETUP-GUIDE.md`**

---

## 💰 Cost Summary

| Item | Cost |
|------|------|
| Supabase (Free tier) | $0 |
| Stripe (Test mode) | $0 |
| Development (Mock mode) | $0 |
| **Total** | **$0** |

Your $5 budget is safe! 🛡️
