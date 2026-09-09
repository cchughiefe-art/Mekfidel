# Mekfidel AI CMS Assistant Setup

The assistant is available at `/admin/ai-assistant`. It creates a preview first and only changes the CMS after an admin approves it.

## 1. Prepare Supabase

Open the Supabase dashboard, select the Mekfidel project, open **SQL Editor**, and run the complete contents of:

`sql/ai_cms_assistant.sql`

This creates the private audit and rollback table. Only the admin who created a request can read its history. Browser clients cannot alter the audit records.

## 2. Create a free Gemini API key

Open [Google AI Studio](https://aistudio.google.com/apikey), sign in, and create an API key. Do not paste the key into source code or send it in chat.

## 3. Add Vercel environment variables

In Vercel, open **Mekfidel → Settings → Environment Variables** and add:

- `GEMINI_API_KEY`: the key from Google AI Studio
- `GEMINI_MODEL`: `gemini-3.5-flash`

Apply both to Production, Preview, and Development. Confirm that `SUPABASE_SERVICE_ROLE_KEY` is also present; it must never start with `NEXT_PUBLIC_`.

## 4. Deploy

Push this commit to the GitHub branch connected to Vercel, or upload the included project files. Vercel will rebuild automatically.

After deployment, sign in as an admin and open:

`https://mekfidel.vercel.app/admin/ai-assistant`

Start with a low-risk request such as: `Show me all products with 5 or fewer items in stock.` Then test a small content change, inspect the preview, approve it, and use **Rollback** in Recent Requests to verify recovery.

## Safety limits

The assistant can update approved fields on products, homepage sections, and company information, or create a category. It cannot run SQL, delete content, modify users or roles, change authentication, upload files, or bypass the confirmation step.
