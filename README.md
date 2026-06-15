# 🌊 Trauma Dump — Full Source Code

> "A safe place to say what you've never said out loud."

A full-stack social platform built with **Next.js 15**, **Express.js**, and **MongoDB Atlas**.

---

## 📁 Project Structure

```
traumadump/
├── frontend/          # Next.js 15 app
│   └── src/
│       ├── app/       # Pages (App Router)
│       │   ├── page.tsx              ← Landing page
│       │   ├── feed/page.tsx         ← Feed
│       │   ├── create/page.tsx       ← Create post
│       │   ├── login/page.tsx        ← Login
│       │   ├── register/page.tsx     ← Register
│       │   ├── search/page.tsx       ← Search
│       │   ├── post/[slug]/          ← Post detail
│       │   ├── profile/[username]/   ← User profile
│       │   └── category/[slug]/      ← Category page
│       ├── components/
│       │   ├── layout/Navbar.tsx
│       │   ├── layout/Providers.tsx
│       │   └── post/PostCard.tsx
│       ├── lib/
│       │   ├── api.ts               ← Axios instance
│       │   └── utils.ts             ← Helpers
│       ├── store/authStore.ts       ← Zustand auth
│       └── types/index.ts           ← TypeScript types
│
└── backend/           # Express.js API
    └── src/
        ├── index.ts                 ← Server entry
        ├── config/database.ts       ← MongoDB connection
        ├── models/
        │   ├── User.ts
        │   ├── Post.ts
        │   ├── Comment.ts
        │   ├── Reaction.ts
        │   ├── Category.ts
        │   └── Report.ts
        ├── controllers/
        │   ├── authController.ts
        │   ├── postController.ts
        │   ├── commentController.ts
        │   └── miscController.ts
        ├── routes/index.ts
        ├── middleware/
        │   ├── auth.ts
        │   └── errorHandler.ts
        └── utils/seed.ts
```

---

## 🚀 Quick Start

### 1. Clone & Install

```bash
# Backend
cd backend
npm install
cp .env.example .env        # Fill in your values

# Frontend
cd ../frontend
npm install
cp .env.local.example .env.local   # Fill in your values
```

### 2. Set up MongoDB Atlas

1. Go to [cloud.mongodb.com](https://cloud.mongodb.com)
2. Create a free cluster
3. Create a database user
4. Whitelist your IP (`0.0.0.0/0` for dev)
5. Copy the connection string into `backend/.env` → `MONGODB_URI`

### 3. Seed Categories

```bash
cd backend
npm run seed
```

### 4. Run Development

```bash
# Terminal 1 — Backend
cd backend && npm run dev

# Terminal 2 — Frontend
cd frontend && npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api/v1
- Health check: http://localhost:5000/health

---

## 🔑 Environment Variables

### Backend (`backend/.env`)
| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGODB_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `FRONTEND_URL` | Frontend origin for CORS |

### Frontend (`frontend/.env.local`)
| Variable | Description |
|---|---|
| `NEXT_PUBLIC_API_URL` | Backend API base URL |
| `NEXT_PUBLIC_GOOGLE_CLIENT_ID` | Google OAuth client ID |
| `NEXT_PUBLIC_APP_URL` | Frontend URL (for OG metadata) |

---

## 📡 API Reference

### Auth
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| POST | `/auth/register` | — | Register with email/password |
| POST | `/auth/login` | — | Login with email/password |
| POST | `/auth/google` | — | Google OAuth login |
| GET | `/auth/me` | ✅ | Get current user |

### Posts
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts` | Optional | List posts (with filters) |
| GET | `/posts/trending` | — | Get trending posts |
| POST | `/posts` | ✅ | Create a post |
| GET | `/posts/:slug` | Optional | Get single post |
| PUT | `/posts/:slug` | ✅ | Update post (owner only) |
| DELETE | `/posts/:slug` | ✅ | Delete post (owner/admin) |
| POST | `/posts/:slug/react` | ✅ | React to a post |

### Comments
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/posts/:slug/comments` | — | Get post comments |
| POST | `/posts/:slug/comments` | ✅ | Add a comment |
| DELETE | `/comments/:id` | ✅ | Delete comment |

### Other
| Method | Endpoint | Auth | Description |
|---|---|---|---|
| GET | `/categories` | — | All categories |
| GET | `/categories/:slug` | — | Single category |
| GET | `/users/:username` | — | User profile + posts |
| PUT | `/users/me` | ✅ | Update own profile |
| GET | `/search?q=&type=` | — | Search posts or users |
| GET | `/stats` | — | Platform stats |
| POST | `/reports` | ✅ | Submit a report |

#### Query params for `GET /posts`
- `page` — page number (default 1)
- `limit` — items per page (default 10)
- `category` — category slug
- `sort` — `latest` | `trending` | `top`
- `search` — text search

---

## 🗄️ Database Schema

### User
```
username, email, password (hashed), googleId, avatar,
bio, isAnonymousDefault, role, isActive,
postsCount, reactionsReceived, timestamps
```

### Post
```
title, slug (unique), content, author (ref: User),
category (ref: Category), isAnonymous, tags[],
reactions: { understand, support, strong, notAlone, hope },
commentCount, viewCount, isPublished, isReported, timestamps
```

### Comment
```
content, author (ref: User), post (ref: Post),
isAnonymous, parentComment (ref: Comment), likes, isReported, timestamps
```

### Reaction
```
user (ref: User), post (ref: Post),
type: understand | support | strong | notAlone | hope
Unique index: (user, post) — one reaction per user per post
```

### Category
```
name, slug (unique), description, icon, color,
postCount, isActive
```

### Report
```
reporter (ref: User), targetType: post | comment,
targetId, reason, description, status: pending | reviewed | resolved | dismissed
```

---

## 🌐 Deployment

### Backend → Render.com
1. Push backend to GitHub
2. Create new **Web Service** on Render
3. Build command: `npm install && npm run build`
4. Start command: `npm start`
5. Add all `.env` variables in Render dashboard
6. After deploy, run: `npm run seed` (one-time via Render shell)

### Frontend → Vercel
1. Push frontend to GitHub
2. Import project on Vercel
3. Framework preset: **Next.js**
4. Add `NEXT_PUBLIC_API_URL` pointing to your Render backend URL
5. Deploy

### MongoDB Atlas
- Use **M0 Free Tier** for dev
- Upgrade to **M10+** for production
- Enable backups in production
- Add Render's outbound IPs to the allowlist (or use 0.0.0.0/0)

---

## 🎨 Design System

### Colors
| Token | Value | Use |
|---|---|---|
| `brand-500` | `#6366f1` | Primary CTAs |
| `lavender` | `#ede9fe` | Backgrounds |
| `mint` | `#d1fae5` | Success states |
| `peach` | `#fde8d8` | Warm accents |
| `sky` | `#e0f2fe` | Info states |

### Reaction Types
| Type | Emoji | Label |
|---|---|---|
| `understand` | ❤️ | I Understand |
| `support` | 🤗 | Sending Support |
| `strong` | 💪 | Stay Strong |
| `notAlone` | 🙏 | You're Not Alone |
| `hope` | 🌱 | Hope Things Improve |

---

## 🛣️ Roadmap

### MVP ✅
- [x] Auth (email + Google)
- [x] Create & browse posts
- [x] Anonymous posting
- [x] Emotional reactions
- [x] Comments
- [x] Categories
- [x] User profiles
- [x] Search
- [x] Reporting

### Phase 2
- [ ] Rich text editor (TipTap)
- [ ] Image uploads (Cloudinary)
- [ ] Email notifications
- [ ] Admin dashboard
- [ ] AI content moderation

### Phase 3
- [ ] Private journals
- [ ] Direct messaging
- [ ] Mobile app (React Native)
- [ ] Mood tracking
- [ ] Premium features

---

## 📄 License
MIT — build freely, share openly.
