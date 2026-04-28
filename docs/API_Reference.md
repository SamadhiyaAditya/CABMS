# CAMS — API Endpoint Reference

> Base URL: `http://localhost:3001`
> Auth: JWT Bearer Token in `Authorization` header

---

## Auth Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/auth/register` | Public | Register as customer or shopkeeper |
| POST | `/auth/login` | Public | Login and receive JWT |
| GET | `/auth/me` | Any | Get current user profile |

## Menu & Catalogue Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/menu` | Public | Get full menu with categories and items |
| GET | `/menu/categories` | Public | Get all menu categories |
| POST | `/menu/categories` | Shopkeeper | Create a new category |
| POST | `/menu/items` | Shopkeeper | Add a new menu item |
| PUT | `/menu/items/:id` | Shopkeeper | Update a menu item |
| DELETE | `/menu/items/:id` | Shopkeeper | Remove a menu item |

## Cart Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/cart` | Customer | View current cart |
| POST | `/cart/items` | Customer | Add item to cart |
| PUT | `/cart/items/:id` | Customer | Update cart item quantity |
| DELETE | `/cart/items/:id` | Customer | Remove item from cart |

## Order Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/orders/checkout` | Customer | Place order from cart |
| GET | `/orders/history` | Customer | View own order history |
| GET | `/orders/:id` | Customer / Shopkeeper | View single order details |
| GET | `/orders/all` | Shopkeeper | View all orders |
| PATCH | `/orders/:id/status` | Shopkeeper | Update order status |
| GET | `/orders/stream` | Shopkeeper | SSE stream for live dashboard |

## Inventory Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/inventory` | Shopkeeper | View inventory status of all items |
| PATCH | `/inventory/:itemId` | Shopkeeper | Update stock count for an item |

## Reviews Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| POST | `/reviews/:menuItemId` | Customer | Submit a review for a purchased item |
| GET | `/reviews/:menuItemId` | Public | Get all reviews for a menu item |

## Reports Module

| Method | Endpoint | Auth | Description |
|--------|----------|------|-------------|
| GET | `/reports?type=sales` | Shopkeeper | Get sales analytics |
| GET | `/reports?type=inventory` | Shopkeeper | Get inventory valuation report |
| GET | `/reports?type=top-items` | Shopkeeper | Get most ordered items |

---

## Error Response Format

All errors follow a consistent JSON format:

```json
{
  "error": "Human-readable error message"
}
```

| Status Code | Meaning |
|-------------|---------|
| 400 | Validation error / Bad request |
| 401 | Authentication failed / Invalid token |
| 403 | Forbidden — wrong role |
| 404 | Resource not found |
| 409 | Conflict — duplicate / stock error |
| 500 | Internal server error |
