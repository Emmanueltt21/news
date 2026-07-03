# Your Daily Light - Devotional Web App

A clean, responsive web application for reading daily devotionals from the "Your Daily Light" backend. It serves as a web counterpart to the mobile app, providing users with daily spiritual guidance, bible readings, confessions, and studies.

## Features

- **Daily Devotionals:** View the devotional for the current day automatically.
- **Date Picker:** Easily navigate to past or future dates (within the allowed range) to read specific devotionals.
- **Multilingual Support:** Supports English (EN), French (FR), and German (DE). The content automatically switches to the localized version if available from the API.
- **Responsive Design:** Optimized for both mobile devices and desktop browsers.
- **CORS Proxy:** Includes a built-in `proxy.php` to securely fetch data from the backend API without triggering cross-origin restrictions in the browser.

## Technologies Used

- **HTML5 / CSS3 / Vanilla JavaScript:** No heavy frontend frameworks required.
- **Flatpickr:** Used for the elegant and lightweight date selection interface.
- **DOMPurify:** Safely renders HTML content returned by the backend API.
- **PHP:** A lightweight proxy script to fetch data from the API and bypass browser CORS policies.

## How to Run Locally

Because the application relies on `proxy.php` to securely fetch data from the remote backend API, you must run it using a local server that supports PHP.

1. **Prerequisites:** Make sure you have PHP installed on your machine.
2. **Open your Terminal:** Navigate to the root directory of this project.
3. **Start the PHP Development Server:**
   ```bash
   php -S localhost:8000
   ```
4. **View in Browser:** Open your browser and navigate to [http://localhost:8000](http://localhost:8000).

*(Note: If you use a standard Python HTTP server or VS Code Live Server, the API requests will fail because the `proxy.php` file will not be executed).# news
