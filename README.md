# E-Commerce Frontend

React-based web UI — part of the ecommerce microservices platform.

## Tech Stack

- React 18
- Axios

## Prerequisites

- Node.js 18+
- Product Service running on port 3001
- Order Service running on port 3002

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file:

```
REACT_APP_PRODUCT_API=http://localhost:3001
REACT_APP_ORDER_API=http://localhost:3002
```

## Running Locally

```bash
npm start
```

App runs on http://localhost:3000

## Building for Production

```bash
npm run build
```

## Docker

```bash
docker build -t abhyas01/ecommerce-frontend .
docker run -p 3000:80 abhyas01/ecommerce-frontend
```
