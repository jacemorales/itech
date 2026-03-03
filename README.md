# iTech gadgets - Full Gadget E-Commerce Website

A modern, production-ready gadget e-commerce platform built with React, TypeScript, and Tailwind CSS v4.

## Features

- **Home Page**: Real-time search and multi-category filtering.
- **Product Details**: Full descriptions, auto-changing image slideshow, and quantity selection.
- **Review System**: User reviews with star ratings, stored in Google Sheets.
- **Cart System**: Persistent local storage, quantity adjustment, and slide-in drawer.
- **Checkout Flow**: Support for WhatsApp/Telegram contact, delivery fee calculation, and payment redirection.
- **Admin Panel**: Password-protected gadget management (Add/Edit) with multiple image support.
- **Custom Requests**: Floating request feature for users to request specific gadgets.

## Tech Stack

- **Frontend**: React 19, TypeScript, Vite
- **Styling**: Tailwind CSS v4, Framer Motion (animations), Lucide React (icons)
- **State Management**: React Context API
- **Backend/Database**: Google Sheets (via Google Apps Script)

## Google Sheets Setup

To use Google Sheets as your database, follow these steps:

### 1. Create a Google Spreadsheet
Create a new Google Sheet named `iTech_DB`.

### 2. Create Required Sheets (Tabs)
Create four tabs at the bottom with these exact names and column headers in the first row:

#### **Products**
Headers: `id`, `name`, `description`, `price`, `categories`, `imageUrl`, `dateAdded`

#### **Reviews**
Headers: `id`, `productId`, `userName`, `comment`, `rating`, `date`

#### **CustomRequests**
Headers: `id`, `gadgetName`, `description`, `imageUrl`, `email`, `date`

#### **Orders**
Headers: `fullName`, `matricNumber`, `regNumber`, `email`, `platform`, `platformValue`, `deliveryLocation`, `items`, `subtotal`, `deliveryFee`, `total`, `date`

### 3. Deploy Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Replace the default code with this script:

```javascript
const SPREADSHEET_ID = 'YOUR_SPREADSHEET_ID_HERE';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === 'getProducts') {
    const sheet = ss.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    const result = rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        if (header === 'categories') {
          obj[header] = row[i] ? row[i].toString().split(',') : [];
        } else if (header === 'imageUrl') {
          obj[header] = row[i] ? row[i].toString().split(',') : [];
        } else if (header === 'price') {
          obj[header] = Number(row[i]);
        } else {
          obj[header] = row[i];
        }
      });
      return obj;
    });
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'getReviews') {
    const productId = e.parameter.productId;
    const sheet = ss.getSheetByName('Reviews');
    const data = sheet.getDataRange().getValues();
    const headers = data[0];
    const rows = data.slice(1);
    const result = rows
      .map(row => {
        let obj = {};
        headers.forEach((header, i) => {
          obj[header] = row[i];
        });
        return obj;
      })
      .filter(review => String(review.productId) === String(productId));
    return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
  }
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  if (action === 'addReview') {
    const sheet = ss.getSheetByName('Reviews');
    const id = Utilities.getUuid();
    sheet.appendRow([id, body.productId, body.userName, body.comment, body.rating, body.date]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'addProduct') {
    const sheet = ss.getSheetByName('Products');
    const id = Utilities.getUuid();
    const imageUrl = Array.isArray(body.imageUrl) ? body.imageUrl.join(',') : body.imageUrl;
    const dateAdded = new Date().toISOString().split('T')[0];
    sheet.appendRow([id, body.name, body.description, body.price, body.categories.join(','), imageUrl, dateAdded]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'updateProduct') {
    const sheet = ss.getSheetByName('Products');
    const data = sheet.getDataRange().getValues();
    const id = body.id;
    for (let i = 1; i < data.length; i++) {
      if (String(data[i][0]) === String(id)) {
        if (body.name) sheet.getRange(i + 1, 2).setValue(body.name);
        if (body.description) sheet.getRange(i + 1, 3).setValue(body.description);
        if (body.price) sheet.getRange(i + 1, 4).setValue(body.price);
        if (body.categories) sheet.getRange(i + 1, 5).setValue(body.categories.join(','));
        if (body.imageUrl) {
          const imageUrl = Array.isArray(body.imageUrl) ? body.imageUrl.join(',') : body.imageUrl;
          sheet.getRange(i + 1, 6).setValue(imageUrl);
        }
        break;
      }
    }
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'addCustomRequest') {
    const sheet = ss.getSheetByName('CustomRequests');
    const id = Utilities.getUuid();
    sheet.appendRow([id, body.gadgetName, body.description, body.imageUrl, body.email, body.date]);
    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }

  if (action === 'addOrder') {
    const sheet = ss.getSheetByName('Orders');
    sheet.appendRow([
      body.fullName, body.matricNumber, body.regNumber, body.email,
      body.platform, body.platformValue, body.deliveryLocation,
      body.items, body.subtotal, body.deliveryFee, body.total, body.date
    ]);

    // Optional: Notify Admin via Email
    try {
      const adminEmail = 'jacemorales54321@gmail.com';
      const subject = 'New Order Received - ITECHGADETS';
      const bodyText = `New order from ${body.fullName}\n\n` +
                       `Items: ${body.items}\n` +
                       `Total: ₦${body.total.toLocaleString()}\n` +
                       `Contact: ${body.platform} - ${body.platformValue}\n` +
                       `Delivery: ${body.deliveryLocation}`;
      MailApp.sendEmail(adminEmail, subject, bodyText);
    } catch (e) {
      // Email quota might be exceeded or failed
    }

    return ContentService.createTextOutput(JSON.stringify({ success: true })).setMimeType(ContentService.MimeType.JSON);
  }
}
```

3. Update `YOUR_SPREADSHEET_ID_HERE` with your sheet ID from the URL.
4. **Deploy > New Deployment**. Select **Web App**. Execute as **Me**. Who has access **Anyone**.
5. Re-authorize if prompted. Copy the **Web App URL**.

### 4. Important Implementation Note
To prevent descriptions from showing as a single "blob" of text, the website uses `white-space: pre-wrap;` on the description container. This ensures that all line breaks and spacing entered in the Admin panel are preserved in the product display.

## Admin Panel Access
- **URL**: `/admin`
- **Password**: `mmm`

## Initial Data (Insert into Products sheet)
| id | name | description | price | categories | imageUrl |
|----|------|-------------|-------|------------|----------|
| 1 | iPod Classic | The original music player. | 50000 | iPod | https://images.unsplash.com/photo-1591337676887-a217a6970a8a |
| 2 | iPad Pro | Powerful tablet for professionals. | 450000 | iPad | https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0 |
| 3 | MacBook Air | Lightweight and powerful laptop. | 850000 | Laptop | https://images.unsplash.com/photo-1517336714460-4c504a29643d |
| 4 | Bluetooth Speaker | High-quality sound on the go. | 25000 | Speaker | https://images.unsplash.com/photo-1608156639585-342c718537c3 |
