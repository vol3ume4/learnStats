# Deployment Guide for LearnStats

This guide will help you deploy your LearnStats application to Vercel.

## Prerequisites

1.  **GitHub Account**: Ensure your code is pushed to a GitHub repository.
2.  **Vercel Account**: Sign up at [vercel.com](https://vercel.com).
3.  **Supabase Project**: You should have your Supabase project URL and keys ready.
4.  **Gemini API Key**: You should have your Google AI Studio key ready.

## Step 1: Verify Environment (Optional but Recommended)

Before deploying, you can verify your keys work by running the test script locally:

```bash
node scripts/test-db-connection.js
```

If this passes, your keys are correct.

## Step 2: Deploy to Vercel

1.  **Login to Vercel**: Go to your Vercel dashboard.
2.  **Add New Project**: Click "Add New..." -> "Project".
3.  **Import Git Repository**: Select your `learnstats` repository.
4.  **Configure Project**:
    *   **Framework Preset**: Vercel should automatically detect **Next.js**.
    *   **Root Directory**: If your app is in the root of the repo, leave this as `./`.
5.  **Environment Variables**:
    *   Expand the **Environment Variables** section.
    *   Add the following variables (copy values from your `.env.local` or Supabase/Google dashboards):
        *   `NEXT_PUBLIC_SUPABASE_URL`
        *   `NEXT_PUBLIC_SUPABASE_ANON_KEY`
        *   `DATABASE_URL` (Use the "Transaction Pooler" connection string from Supabase if available, otherwise the Direct one. It looks like `postgres://postgres.[ref]:[password]@aws-0-[region].pooler.supabase.com:6543/postgres`)
        *   `GEMINI_API_KEY`
6.  **Deploy**: Click **Deploy**.

## Step 3: Post-Deployment Check

1.  Wait for the build to complete.
2.  Visit the provided domain (e.g., `learnstats.vercel.app`).
3.  **Test Student Login**:
    *   Go to `/student`.
    *   It should redirect to `/login`.
    *   Login with a test account.
    *   It should redirect back to `/student`.
4.  **Test Teacher Mode**:
    *   Go to `/teacher` (if you have a teacher account setup).
    *   Try generating questions to verify Gemini and Database connectivity.

## Troubleshooting

*   **Build Failed**: Check the "Logs" tab in Vercel. Common issues are missing dependencies or syntax errors.
*   **Database Error**: Check the "Runtime Logs". If you see connection errors, verify `DATABASE_URL`.
*   **Login Loop (310)**: If you get "Too many redirects", clear your browser cookies and try again. Ensure your Supabase project URL is correct in the environment variables.
