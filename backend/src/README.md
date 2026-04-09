# Backend Directory Architecture

Welcome to the backend codebase! Here is a simple guide to understand what each folder does, mapped directly to industry-standard 3-tier architecture.

- `config/` - **Environment Setup**. Everything related to connecting to the database or loading your `.env` variables cleanly.
- `controllers/` - **Traffic Cops**. They receive incoming HTTP requests (like `req.body`), validate them, hand them to the `services/`, and send back the HTTP `res.json()`. No database logic here.
- `middlewares/` - **Security Checkpoints**. Functions that run *before* connecting to routes (e.g., verifying a user's JWT token or checking if they are a SHOPKEEPER).
- `models/` - **OOP Data Classes**. Abstract definitions mapping to our Prisma schema, containing methods like `getPermissions()`.
- `patterns/` - **System Design Patterns**. Specialized classes explicitly built to showcase the 7 required design patterns (e.g. Singleton, Composite, Factory).
- `routes/` - **URLs**. Connects strings like `/auth/login` straight to the correct Controller.
- `services/` - **The Brains (Business Logic)**. The heavy lifting happens here. They take data from controllers, talk to the database using Prisma, and throw any errors if business rules map poorly.
- `utils/` - **Helpers**. Generic things like standard Custom Error definitions.
- `validators/` - **Rules Checkers**. Zod schemas that automatically guarantee the data the frontend sends matches exactly what we expect (e.g. `price` must be a positive number).

Every file is specifically built to follow the **S.O.L.I.D. principles** ensuring things are strictly decoupled!
