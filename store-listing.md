# Flushy - App Store Listing

## App Name
Flushy

## Subtitle (iOS - 30 chars max)
Gut Health & Stool Tracker

## Short Description (Google Play - 80 chars max)
Track your gut health privately. Log stool type, color & patterns with ease.

## Full Description (Both Stores)

Take control of your gut health with Flushy — a simple, private stool tracker based on the Bristol Stool Scale.

**Why Flushy?**
Your gut health says a lot about your overall well-being. Flushy makes it easy to track your bowel movements, spot patterns, and understand what affects your digestion — all without compromising your privacy.

**Key Features:**

- **Bristol Stool Scale Tracking** — Log your stool type using the medically recognized 7-type scale with clear health indicators
- **Color Monitoring** — Track stool color with 8 options, each flagged as normal, attention, or alert
- **Quick Tags** — Add context like coffee, stress, medication, exercise, dairy, spicy food, and more
- **Gut Score** — Get a daily health assessment based on your logged data
- **Insights & Patterns** — View weekly activity, streaks, and trends to understand your digestion
- **Timeline View** — Browse your full history with a calendar and detailed entries
- **Achievements** — Stay motivated with badges for consistent tracking
- **PDF Health Report** — Export a detailed report to share with your doctor
- **Backup & Restore** — Protect your data with manual JSON backups
- **Daily Reminders** — Never forget to log with customizable notifications
- **5 Beautiful Themes** — Dark, Light, Nature, Blush, and Mono
- **100% Private** — All data stays on your device. No accounts, no cloud, no tracking

**Who is Flushy for?**
Anyone who wants to better understand their digestive health — whether you're managing IBS, tracking dietary changes, preparing for a doctor's visit, or just being proactive about your well-being.

**Your data, your device.** Flushy never uploads, shares, or accesses your personal health information. Everything stays local on your phone.

Download Flushy and start understanding your gut today.

## Keywords (iOS - 100 chars max)
stool,tracker,gut,health,bristol,scale,bowel,digestion,ibs,poop,wellness,log

## Category
- Primary: Health & Fitness
- Secondary: Medical

## Age Rating
- 4+ (iOS)
- Everyone (Android)

## Price
- $0.99 USD (paid upfront, no subscriptions, no in-app purchases)

## Support Email
support@flushyapp.com

---

## URLs Required by Both Stores

### Privacy Policy URL
**Required by Apple AND Google.**
File: `privacy-policy.html` (included in repo)

### Terms of Service URL
**Required by Apple. Recommended by Google.**
File: `terms-of-service.html` (included in repo)

### How to Host (free options)

**Option A: GitHub Pages (recommended)**
1. Push this repo to GitHub (or create a separate public repo)
2. Go to Settings > Pages > Enable from `main` branch
3. Your URLs will be:
   - `https://YOUR_USERNAME.github.io/flushy/privacy-policy.html`
   - `https://YOUR_USERNAME.github.io/flushy/terms-of-service.html`

**Option B: Netlify Drop (quickest)**
1. Go to https://app.netlify.com/drop
2. Drag & drop the two HTML files
3. Get instant public URLs

**Option C: Custom domain**
If you own a domain like `flushyapp.com`:
- Host at `https://flushyapp.com/privacy`
- Host at `https://flushyapp.com/terms`

---

## Privacy Details (App Store Connect)

### Apple App Privacy Labels
When asked "What data does your app collect?", select:
- **Data Not Collected** — Flushy does not collect any user data

This is accurate because:
- No analytics SDKs
- No tracking
- No account/login
- No network requests
- All data local-only

### Google Play Data Safety
When filling out the Data Safety form:
- **Does your app collect or share any of the required user data types?** → No
- **Is all of the user data collected by your app encrypted in transit?** → N/A (no data transmitted)
- **Do you provide a way for users to request that their data is deleted?** → Yes (in-app reset feature)

---

## Screenshots Needed

### iPhone (6.7" - iPhone 15 Pro Max) - Required sizes: 1290 x 2796px
1. **Home Screen** — Show dashboard with stats, streak, and recent logs
2. **Log Screen** — Show Bristol Scale selector with type selected
3. **Color & Tags** — Show color picker and quick tags selection
4. **Timeline** — Show calendar with health dots and selected day entries
5. **Insights** — Show type distribution, gut score, and achievements

### iPhone (6.1" - iPhone 15) - Required sizes: 1179 x 2556px
Same 5 screenshots (can scale from 6.7")

### iPad (12.9") - Required if supportsTablet is true: 2048 x 2732px
Same 5 screenshots adapted for tablet

### Android (Phone) - Recommended: 1080 x 1920px
Same 5 screenshots

### Screenshot Headlines (overlay text)
1. "Track with the Bristol Scale"
2. "Monitor Color & Patterns"
3. "Add Context with Quick Tags"
4. "Your Complete Health Timeline"
5. "Understand Your Gut"

---

## Tips for Taking Screenshots

1. Use Expo on a simulator/emulator with the correct resolution
2. Add sample data first so screens look populated (log 7+ days of varied data)
3. Use tools like **AppMockup** (appmockup.io) or **Previewed** (previewed.app) to add device frames and headline text
4. Keep the Dark theme for primary screenshots (most impactful)
5. Consider showing one screenshot with a different theme to highlight customization

---

## App Review Notes (for Apple reviewers)

Use this text in the "Notes" field when submitting for review:

```
Flushy is a gut health tracking app based on the Bristol Stool Scale.
All data is stored locally on the device — there are no accounts, no servers, and no data collection.
The app does not provide medical diagnosis or treatment recommendations.
Health tips and wellness information are sourced from established medical guidelines (WHO, WGO, Bristol Royal Infirmary).
No login is required to test the app — simply complete the brief onboarding flow.
```
