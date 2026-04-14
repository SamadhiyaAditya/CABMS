# 🎨 Frontend Directory Architecture

Welcome to the Next.js `app` router! 

Because we built this for both Customers and Shopkeepers, the structure isolates them perfectly:

- `app/` - The heart of Next.js.
  - `page.tsx` - The landing page and Login Screen where users are authenticated.
  - `layout.tsx` - The global HTML/Body wrapper.
  - `globals.css` - Where our custom Warm/Green Chai Adda styling completely lives (pure Vanilla CSS).
  - `(shopkeeper)/` - A **Route Group**. Any pages inside here (like `/dashboard`) are grouped logically for Shopkeepers. The parentheses `()` mean it won't actually affect the URL path, but it keeps our files wildly organized!
  - `(customer)/` - (Coming in Sprint 3) Route Group similarly isolating the customer browsing logic.
- `lib/` - Utilities and helpers.
  - `api.ts` - Our customized Axios setup that automatically injects JWT tokens securely via cookies to talk to our backend API!

*All UI components use `lucide-react` for beautiful scalable vector graphics.*
