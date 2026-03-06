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
Use this spreadsheet ID: `1J42K_SA9lD8niq4utBopAu04EB7dQt2UwNGu3DCFMt4`
(Or create a new one and copy the ID from the URL).

### 2. Create Required Sheets (Tabs)
Create five tabs at the bottom with these exact names and column headers in the first row:

#### **Products**
Headers: `id`, `name`, `description`, `price`, `categories`, `imageUrl`, `dateAdded`

#### **Reviews**
Headers: `id`, `productId`, `userName`, `comment`, `rating`, `date`

#### **CustomRequests**
Headers: `id`, `gadgetName`, `description`, `imageUrl`, `email`, `date`

#### **Orders**
Headers: `fullName`, `matricNumber`, `regNumber`, `email`, `platform`, `platformValue`, `deliveryLocation`, `items`, `subtotal`, `total`, `date`

#### **ExternalOrders**
Headers: `id`, `gadgetName`, `source`, `quantity`, `email`, `price`, `totalPrice`, `imageUrl`, `date`

### 3. Deploy Google Apps Script
1. In your Google Sheet, go to **Extensions > Apps Script**.
2. Replace the default code with this script:

```javascript
const SPREADSHEET_ID = '1J42K_SA9lD8niq4utBopAu04EB7dQt2UwNGu3DCFMt4';

function doGet(e) {
  const action = e.parameter.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const getSheetData = (sheetName) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return [];

    let data;
    try {
      data = sheet.getDataRange().getValues();
    } catch (err) {
      return []; // Empty sheet or error
    }

    if (data.length <= 1) return [];
    const headers = data[0];
    const rows = data.slice(1);
    return rows.map(row => {
      let obj = {};
      headers.forEach((header, i) => {
        const val = row[i];
        if (header === 'categories' && val) {
          obj[header] = val.toString().split(',').map(s => s.trim());
        } else if (header === 'imageUrl' && val) {
          obj[header] = val.toString().split(',').map(s => s.trim());
        } else if (header === 'price' || header === 'total' || header === 'subtotal' || header === 'totalPrice' || header === 'rating' || header === 'quantity') {
          obj[header] = isNaN(Number(val)) ? 0 : Number(val);
        } else {
          obj[header] = val;
        }
      });
      return obj;
    });
  };

  let result = [];

  try {
    switch(action) {
      case 'getProducts':
        result = getSheetData('Products');
        break;
      case 'getReviews':
        const productId = e.parameter.productId;
        result = getSheetData('Reviews').filter(r => String(r.productId) === String(productId));
        break;
      case 'getAllReviews':
        result = getSheetData('Reviews');
        break;
      case 'getOrders':
        result = getSheetData('Orders');
        break;
      case 'getExternalOrders':
        result = getSheetData('ExternalOrders');
        break;
      case 'getCustomRequests':
        result = getSheetData('CustomRequests');
        break;
      default:
        result = { error: 'Invalid action: ' + action };
    }
  } catch (err) {
    result = { error: err.toString() };
  }

  return ContentService.createTextOutput(JSON.stringify(result)).setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  const body = JSON.parse(e.postData.contents);
  const action = body.action;
  const ss = SpreadsheetApp.openById(SPREADSHEET_ID);

  const appendToSheet = (sheetName, rowData) => {
    const sheet = ss.getSheetByName(sheetName);
    if (!sheet) return false;
    sheet.appendRow(rowData);
    return true;
  };

  let success = false;

  if (action === 'addReview') {
    const id = Utilities.getUuid();
    success = appendToSheet('Reviews', [id, body.productId, body.userName, body.comment, body.rating, body.date]);
  }

  else if (action === 'addProduct') {
    const id = Utilities.getUuid();
    const imageUrl = Array.isArray(body.imageUrl) ? body.imageUrl.join(',') : body.imageUrl;
    const dateAdded = new Date().toISOString().split('T')[0];
    success = appendToSheet('Products', [id, body.name, body.description, body.price, body.categories.join(','), imageUrl, dateAdded]);
  }

  else if (action === 'updateProduct') {
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
        success = true;
        break;
      }
    }
  }

  else if (action === 'addCustomRequest') {
    const id = Utilities.getUuid();
    success = appendToSheet('CustomRequests', [id, body.gadgetName, body.description, body.imageUrl, body.email, body.date]);
  }

  else if (action === 'addOrder') {
    success = appendToSheet('Orders', [
      body.fullName, body.matricNumber, body.regNumber, body.email,
      body.platform, body.platformValue, body.deliveryLocation,
      body.items, body.subtotal, body.total, body.date
    ]);

    // Notify Admin via Email
    try {
      const adminEmail = 'jacemorales54321@gmail.com';
      const subject = 'New Order Received - ITECHGADETS';
      const bodyText = `New order from ${body.fullName}\n\n` +
                       `Items: ${body.items}\n` +
                       `Total: ₦${body.total.toLocaleString()}\n` +
                       `Contact: ${body.platform} - ${body.platformValue}\n` +
                       `Delivery: ${body.deliveryLocation}`;
      MailApp.sendEmail(adminEmail, subject, bodyText);
    } catch (e) {}
  }

  else if (action === 'addExternalOrder') {
    const id = Utilities.getUuid();
    success = appendToSheet('ExternalOrders', [
      id, body.gadgetName, body.source, body.quantity, body.email,
      body.price, body.totalPrice, body.imageUrl, body.date
    ]);
  }

  return ContentService.createTextOutput(JSON.stringify({ success })).setMimeType(ContentService.MimeType.JSON);
}
```

3. Update `YOUR_SPREADSHEET_ID_HERE` with your sheet ID from the URL.
4. **Deploy > New Deployment**. Select **Web App**. Execute as **Me**. Who has access **Anyone**.
5. Re-authorize if prompted. **Important**: You must grant permissions for the script to send emails on your behalf during authorization.
6. Copy the **Web App URL**.

### 3.1 Email Notification Setup
The script is configured to send an email to `jacemorales54321@gmail.com` whenever a new order is placed.
- **Authorization**: When you deploy the script, Google will ask for permission to "Send email as you". You must click "Allow".
- **Quota**: Free Google accounts have a limit of 100 emails per day via Apps Script.
- **Troubleshooting**: If emails are not arriving, check the "Executions" tab in the Apps Script editor to see if there were any errors.

### 4. Important Implementation Note
To prevent descriptions from showing as a single "blob" of text, the website uses `white-space: pre-wrap;` on the description container. This ensures that all line breaks and spacing entered in the Admin panel are preserved in the product display.

## Admin Panel Access
- **URL**: `/admin`
- **Password**: `mmm`

## Netlify Deployment Instructions
To ensure the site works correctly on Netlify:
1. **Build Settings**:
   - Build command: `npm run build`
   - Publish directory: `dist`
2. **Base Path**: If you are deploying this site within a subdirectory (like `lancer/web`), you should set the "Base directory" in Netlify settings to the root of this project, but ensure your build command and publish directory are correct.
3. **Redirects**: A `_redirects` file is included in the `public` folder to handle Single Page Application (SPA) routing. It will be copied to the `dist` folder automatically during build.
