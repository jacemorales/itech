# iTech gadgets - Full Gadget E-Commerce Website

A modern, production-ready gadget e-commerce platform built with React, TypeScript, and Tailwind CSS v4.

## Features

- **Home Page**: Real-time search and multi-category filtering.
- **Product Details**: Full descriptions, auto-changing image slideshow (for multiple images), and quantity selection.
- **Review System**: User reviews with star ratings, stored in Google Sheets.
- **Cart System**: Persistent local storage, quantity adjustment, and slide-in drawer.
- **Checkout Flow**: Support for WhatsApp/Telegram contact, delivery fee calculation, and payment redirection.
- **Admin Panel**: Password-protected gadget management (Add/Edit) with multiple image support and live previews.
- **Custom Requests**: Floating request feature for users to request specific gadgets.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
- **State Management**: React Context API
- **Backend/Database**: Google Sheets (via Google Apps Script)

## Google Sheets Setup

To use Google Sheets as your database, follow these steps:

### 1. Create a Google Spreadsheet
Create a new Google Sheet and name it (e.g., `iTech_Gadgets_DB`).

### 2. Create Required Sheets (Tabs)
Create three tabs at the bottom of your spreadsheet with these exact names and column headers in the first row:

#### **Products**
Headers: `id`, `name`, `description`, `price`, `categories`, `imageUrl`
*Note: `imageUrl` can contain multiple URLs separated by commas.*

#### **Reviews**
Headers: `id`, `productId`, `userName`, `comment`, `rating`, `date`

#### **CustomRequests**
Headers: `id`, `gadgetName`, `description`, `imageUrl`, `email`, `date`

### 3. Deploy Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Replace the default code with the provided script (see `README.md` original version or use the logic in `src/services/googleSheets.ts`).

## Environment Variables

Create a `.env` file in the root directory:

```env
VITE_GOOGLE_SCRIPT_URL=your_web_app_url_here
```

## Local Development

1. Clone the repository.
2. Install dependencies: `npm install`.
3. Start development server: `npm run dev`.

## Deployment

1. Build the project: `npm run build`.
2. Deploy the `dist` folder to Netlify.
3. The project includes a `public/_redirects` file to handle SPA routing on Netlify.

## Admin Panel Access

The Admin Panel is located at `/admin`.
- **Password**: `mmm`

## Initial Data Setup
You can manually add these initial items to your **Products** sheet:

| id | name | description | price | categories | imageUrl |
|----|------|-------------|-------|------------|----------|
| 1 | iPod Classic | The original music player. | 50000 | iPod | https://images.unsplash.com/photo-1591337676887-a217a6970a8a |
| 2 | iPad Pro | Powerful tablet for professionals. | 450000 | iPad | https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0 |
| 3 | MacBook Air | Lightweight and powerful laptop. | 850000 | Laptop | https://images.unsplash.com/photo-1517336714460-4c504a29643d |
| 4 | Bluetooth Speaker | High-quality sound on the go. | 25000 | Speaker | https://images.unsplash.com/photo-1608156639585-342c718537c3 |
