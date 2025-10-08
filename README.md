# Juris Mind - AI Legal Document Summarizer

Transform complex legal documents into clear, concise summaries with AI-powered analysis. Juris Mind is designed for lawyers, students, and citizens seeking clarity from lengthy legal documents.

---

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Installation & Development](#installation--development)
- [Deployment](#deployment)
- [Custom Domain](#custom-domain)
- [File & Format Support](#file--format-support)
- [How It Works](#how-it-works)
- [Contributing](#contributing)
- [License](#license)

---

## Features

- **AI Summarization:** Uses generative AI (Google Gemini 2.5 via Lovable API) for legal document summarization.
- **Multilingual Support:** Summarizes documents in multiple languages, including tailored prompts for Indian legal systems.
- **File Upload & Text Input:** Accepts PDF, DOCX, and TXT files, or pasted text.
- **Chat with Document:** Interact conversationally to clarify document details.
- **Modern UI:** Judiciary-themed React interface with Tailwind CSS and shadcn-ui.
- **Client-side PDF Parsing:** Efficiently extracts text from PDFs using pdfjs-dist.

---

## Architecture

### 1. **Frontend**
- **Framework:** React (with Vite)
- **UI:** Tailwind CSS, shadcn-ui components
- **Key Components:**
  - `DocumentInput`: Handles file upload/drag-drop and text paste.
  - `DocumentChat`: Enables chat-based Q&A about uploaded documents.
  - `Hero`: Themed intro section.
  - `Footer`: Judiciary-themed info and links.

### 2. **Backend/API**
- **Supabase Edge Function:** `/supabase/functions/chat-with-document/index.ts`
  - Receives document text and chat messages.
  - Calls Lovable API (Google Gemini 2.5) for AI chat/completion.
  - Legal domain-specific system prompts for accuracy and helpfulness.

### 3. **AI & Summarization Logic**
- **Prompt Engineering:** Custom system/user prompts, language selection, legal term preservation.
- **Model Integration:** Lovable API, Google Gemini 2.5 model.
- **Fine-tuning Utilities:** Placeholder for future training/fine-tuning on legal datasets.

### 4. **Document Parsing**
- **PDF:** Uses `pdfjs-dist` for client-side parsing.
- **DOCX/TXT:** Handled via FileReader (with room for future docx parser integration).

### 5. **Deployment & Hosting**
- Code and prompt updates via Lovable platform or directly via GitHub.
- Supports instant preview and auto-reload on development server.

---

## Tech Stack

- **React** + **Vite**
- **TypeScript**
- **shadcn-ui** (UI components)
- **Tailwind CSS**
- **Supabase** (Functions for AI chat)
- **pdfjs-dist** (PDF parsing)
- **Lovable API** (AI backend)
- **Google Gemini 2.5 Flash** (AI model)

---

## Installation & Development

### Requirements
- Node.js & npm (recommended: use [nvm](https://github.com/nvm-sh/nvm#installing-and-updating))
- (Optional) Supabase CLI for edge function deployment

### Local Setup

```sh
# Clone the repository
git clone https://github.com/vyshnav17/jurismind-ai-summarizer-pdf.git
cd jurismind-ai-summarizer-pdf

# Install dependencies
npm i

# Start the development server
npm run dev

# Create the  .env file and add the API Keys here 
VITE_SUPABASE_PROJECT_ID="YOUR SUPABASE PROJECT ID"
VITE_SUPABASE_PUBLISHABLE_KEY="YOUR SUPABASE PUBLISHABLE KEY"
VITE_SUPABASE_URL="YOUR SUPABASE URL"

```

### Editing

- **Directly in GitHub:** Use the web editor
- **GitHub Codespaces:** Supported for cloud IDE development

---

## Deployment

- Use vercel to publish and share.
- See [Vercel docs](https://vercel.com/docs) for deployment and custom domain setup.

---

## Custom Domain

- Navigate to Project > Settings > Domains in vercel.
- Click "Connect Domain" and follow the instructions.

---

## File & Format Support

- **PDF**
- **DOCX**
- **TXT**
- Documents are parsed client-side before AI summarization.

---

## How It Works

1. **Upload or paste your document.**
2. **Client parses and extracts text.**
3. **Text sent to Supabase function, which calls Lovable API.**
4. **AI generates summary based on legal context and requested language.**
5. **View summary and chat with the document for further clarification.**

---

## Contributing

Fork the repository and submit a pull request. For major changes, please discuss first via an issue.

---

## License

This project is licensed under the MIT License. You are free to use, copy, modify, merge, publish, distribute, sublicense, under the terms of the MIT License.

---

**Juris Mind** — AI-powered clarity for legal documents.
