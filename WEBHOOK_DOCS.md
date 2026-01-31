# Automify Webhook Documentation

Automify supports incoming webhooks for Drive Activity and outgoing notifications. This document outlines the endpoints, payloads, and authentication required.

## 1. Google Drive Activity Notifications

Endpoint for receiving change notifications from Google Drive Resource IDs.

- **URL**: `/api/drive-activity/notifications`
- **Method**: `POST`
- **Headers**:
  - `x-goog-resource-id`: The unique ID assigned to the resource during channel creation.

### Payload

Google Drive notifications generally don't contain data in the body; the logic is triggered based on the resource ID in the header.

---

## 2. Payment Webhooks (Stripe)

Endpoint for processing Stripe checkout session completions.

- **URL**: `/api/payment`
- **Method**: `GET` (Fetch Products) / `POST` (Create Checkout Session)

### GET /api/payment

Fetches the latest subscription products.

- **Response**: Array of price objects.

### POST /api/payment

Initiates a Stripe Checkout Session.

- **Body**:
  ```json
  {
    "priceId": "price_123..."
  }
  ```
- **Response**: URL to the Stripe checkout page.

---

## 3. Rate Limiting

To ensure platform stability, we enforce rate limiting on all API routes.

- **Limit**: 20 requests per minute per IP.
- **Header**: `429 Too Many Requests` when exceeded.
- **Retry-After**: Time in seconds to wait before retrying.

> [!TIP]
> Use exponential backoff when your automation steps fail to avoid hitting these limits during retries.

---

## 4. Error Handling

All API endpoints return standard HTTP status codes:

- `200 OK`: Success
- `400 Bad Request`: Validation failure
- `401 Unauthorized`: Authentication missing
- `429 Too Many Requests`: Rate limit exceeded
- `500 Internal Server Error`: Unexpected server issue
