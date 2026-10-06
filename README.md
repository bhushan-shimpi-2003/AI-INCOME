# AI Income for Everyone — React Sales Page + Protected Reader

This project is a Vite + React storefront and browser reader for the uploaded ebook manuscript.

## Run locally

```bash
npm install
npm run dev
```

Then open the local Vite URL.

## Build

```bash
npm run build
```

The production output is in `dist/`.

## Deploy to Vercel

### Option 1: Via Vercel Dashboard (Recommended)
1. Go to [vercel.com](https://vercel.com) and import the repository: `https://github.com/bhushan-shimpi-2003/AI-INCOME`
2. Vercel automatically detects Vite as the framework.
3. Build Command: `npm run build`
4. Output Directory: `dist`
5. Click **Deploy**.

### Option 2: Via Vercel CLI
```bash
npm i -g vercel
vercel
```


## Important: copy/download protection

A browser cannot provide absolute DRM. If the full text is sent to a user's browser, a determined user can still recover it through developer tools, network inspection, screenshots or OCR.

This project therefore implements **casual-copy deterrence**:
- disables context menu
- disables text selection/dragging
- blocks common Ctrl/Cmd copy, save, print and view-source shortcuts
- removes the print view
- does not include a download button
- displays the book in a reader-style layout
- uses a watermark

For real paid distribution, do not rely on the demo unlock. Put payment verification and access control on a server.

## Recommended production payment/access flow

1. Frontend requests an order from your backend.
2. Backend creates the payment order (Razorpay/Gumroad/etc.).
3. Frontend opens checkout.
4. Backend verifies the payment signature/webhook.
5. Backend issues a short-lived signed reader token.
6. Reader API returns only the chapter currently being read.
7. Expire/revoke the token when appropriate.
8. Keep the complete manuscript out of public JS bundles if stronger protection matters.

## Where to customize

- `src/main.jsx`: price, author, storefront copy, payment hook, access flow.
- `src/ebookContent.js`: manuscript content extracted from the uploaded DOCX.
- `src/styles.css`: complete visual design.
- `public/cover.png`: uploaded cover artwork.

The manuscript source includes the author's 2026 copyright notice and educational/informational disclaimer.
