Design prototype for Inventory & Sales Management

Files:
- login.html — Login screen
- manager.html — Manager dashboard with inventory and add product modal
- purchase.html — Purchase orders with auto totals
- seller.html — Seller dashboard with "Sell One" buttons and cash box
- reports.html — Simple charts (Chart.js)
- app.js — Shared JS logic and demo data

How to run:
Open the files in the `design/` folder in a browser (e.g., open `design/manager.html`). Files use CDN Tailwind and Chart.js, so no build step required.

Notes:
- RTL: pages use dir="rtl". Toggle direction via the RTL button in manager.
- Dark mode: toggle in manager header (applies `dark` class on `<html>`).
- This is a static high-fidelity UI prototype for demonstration and can be integrated into a React/Vite project using Tailwind properly.
