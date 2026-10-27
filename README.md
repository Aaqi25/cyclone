<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

# Run and deploy your AI Studio app

This contains everything you need to run your app locally.

View your app in AI Studio: https://ai.studio/apps/8390f2a1-30b5-4970-840d-8062534449f4

## Run Locally

**Prerequisites:**  Node.js


1. Install dependencies:
   `npm install`
2. Configure `.env` (copy from `.env.example` if needed)
3. Run the app locally:
   `npm run dev`

---

## Deployment Guide

### 1. Backend on Render (Web Service)
1. In Render Dashboard, click **New +** -> **Web Service**.
2. Connect your repository: `Aaqi25/cyclone`.
3. Set the following settings:
   - **Runtime**: Node
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
4. Under **Environment Variables**, add:
   - `NODE_ENV`: `production`
   - `JWT_SECRET`: (your secure secret string)
   - `PORT`: `10000` (or Render's default port)
   - `MONGODB_URI`: *(Optional)* MongoDB Atlas connection string (if not set, runs in in-memory Demonstration Store mode).
   - `GEMINI_API_KEY`: *(Optional)* Your Gemini API key for AI disaster briefings.
5. Deploy the service and copy your Render URL (e.g., `https://cyclone-backend.onrender.com`).

### 2. Frontend on Vercel
1. In Vercel Dashboard, click **Add New...** -> **Project**.
2. Import the `Aaqi25/cyclone` repository.
3. Framework Preset: **Vite**
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Your Render backend URL (e.g., `https://cyclone-backend.onrender.com`)
5. Click **Deploy**. Vercel will build the frontend and route API calls to your Render backend.
