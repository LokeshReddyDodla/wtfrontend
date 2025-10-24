# ⚡ Quick Deploy - 3 Steps!

**No environment variables needed!**

---

## 1️⃣ Edit Config (1 line change)

Open `client/src/config.ts` and change this line:

```typescript
return 'https://your-backend-domain.com';  // ← Your production API URL
```

**Examples:**
- `https://api.myapp.com`
- `https://mybackend.herokuapp.com`  
- `${window.location.origin}/api` (if backend is on same domain)

---

## 2️⃣ Build

```bash
npm install && npm run build
```

**Output:** `dist/public/` folder

---

## 3️⃣ Deploy

### Vercel (Recommended)
```bash
npm i -g vercel
vercel --prod
```

### Netlify
Drag & drop `dist/public` folder to [netlify.com](https://netlify.com)

### Any Host
Upload `dist/public/*` to your static hosting

---

## ✅ Done!

That's it. No `.env` files, no secrets, no complexity.

**Questions?** See [DEPLOYMENT_SIMPLE.md](./DEPLOYMENT_SIMPLE.md) for details.

