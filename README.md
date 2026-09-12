# Chaos Route
[![npm version](https://img.shields.io/npm/v/@priyabrat/chaos-route.svg)](https://www.npmjs.com/package/@priyabrat/chaos-route)

> Intentionally break your Express.js API routes to test how your application handles failures.

**Chaos Route** is an Express middleware package for controlled fault injection during development and testing.

It lets you configure failures for specific routes without modifying your controllers or frontend code.

For example, you can make `/api/login` timeout, return a `500` error, or introduce artificial latency simply by changing `chaos.config.json`.

---

## Why Chaos Route?

Applications usually work perfectly during development.

But what happens when:

* Login takes too long?
* An API suddenly returns `500`?
* A request is delayed by several seconds?
* Your frontend receives an unexpected backend failure?
* Your loading state never finishes?
* Your error handling isn't actually working?

Chaos Route lets you intentionally create these situations so you can test how your application behaves when things go wrong.

---

## Installation

```bash
npm install @priyabrat/chaos-route;
```
OR

```bash
npm install @priyabrat/chaos-route -D;
```
---

## Quick Start

### 1. Add Chaos Route to your Express application

```js
import express from "express";
import { chaos } from "@priyabrat/chaos-route";

const app = express();

app.use(chaos());

app.post("/api/login", loginController);

app.listen(5000, () => {
    console.log("Server running on port 5000");
});
```

Place `chaos()` **before the routes you want to test**.

---

### 2. Create `chaos.config.json`

Create this file in the root of your application:

```text
my-express-app/
├── src/
├── package.json
├── chaos.config.json
└── ...
```

Example:

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "http_error",
        "status": 500,
        "message": "Login service failed"
      }
    }
  }
}
```

Now every request to:

```text
POST /api/login
```

will receive the configured failure instead of reaching your login controller.

---

## How It Works

Chaos Route runs as normal Express middleware.

```text
Client
  │
  │ POST /api/login
  ▼
Express
  │
  ▼
Chaos Route
  │
  ├── No configuration ──────→ next()
  │
  ├── Latency ────────────────→ wait → next()
  │
  └── HTTP Error ─────────────→ return error
```

Your existing controllers don't need to know that Chaos Route is being used.

For example:

```js
app.use(chaos());

app.post("/api/login", loginController);
```

With no failure configured:

```text
Request
   ↓
Chaos Route
   ↓
loginController
   ↓
Response
```

With an HTTP error configured:

```text
Request
   ↓
Chaos Route
   ↓
500 Error
```

The `loginController` is never executed.

---

# Configuration

The configuration file(chaos.config.json) uses this structure:

```json
{
  "routes": {
    "/your-route": {
      "failure": {
        "type": "...",
        "status": "code",
        "message": "..."
      }
    }
  }
}
```

Each route can have its own failure configuration.

---

## HTTP Error

Return a controlled HTTP error from a route.

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "http_error",
        "status": 500,
        "message": "Login service unavailable"
      }
    }
  }
}
```

A request to `/api/login` will receive:

```json
{
  "error": "Login service unavailable",
  "chaos": true
}
```

### Options

| Option    | Type           | Default         | Description      |
| --------- | -------------- | --------------- | ---------------- |
| `type`    | `"http_error"` | —               | Failure type     |
| `status`  | `number`       | `500`           | HTTP status code |
| `message` | `string`       | `"Chaos Error"` | Error message    |

You can simulate different HTTP failures:

```json
{
  "type": "http_error",
  "status": 401,
  "message": "Unauthorized"
}
```

or:

```json
{
  "type": "http_error",
  "status": 503,
  "message": "Service unavailable"
}
```

---

# Latency

Artificially delay a request before allowing it to continue to the real Express route.

```json
{
  "routes": {
    "/api/users": {
      "failure": {
        "type": "latency",
        "latencyMs": 3000
      }
    }
  }
}
```

The request flow becomes:

```text
Client
   ↓
/api/users
   ↓
Chaos Route
   ↓
⏳ 3 seconds
   ↓
usersController
   ↓
Response
```

### Options

| Option      | Type        | Default | Description           |
| ----------- | ----------- | ------- | --------------------- |
| `type`      | `"latency"` | —       | Failure type          |
| `latencyMs` | `number`    | `1000`  | Delay in milliseconds |

---

# Multiple Routes

You can configure different failures for different endpoints.

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "http_error",
        "status": 500,
        "message": "Login service failed"
      }
    },

    "/api/users": {
      "failure": {
        "type": "latency",
        "latencyMs": 3000
      }
    }
  }
}
```

Now:

```text
/api/login
    ↓
500 Error

/api/users
    ↓
3 second delay
    ↓
Normal controller
```

---

# Routes Without Chaos

Routes that aren't configured are completely unaffected.

For example:

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "http_error",
        "status": 500
      }
    }
  }
}
```

A request to:

```text
/api/products
```

will simply continue through Express normally.

```text
/api/products
      ↓
Chaos Route
      ↓
next()
      ↓
productsController
```

---

# Disabling a Failure

Remove the `failure` configuration from the route:

```json
{
  "routes": {
    "/api/login": {}
  }
}
```

The request will pass through normally.

You can also remove the route completely:

```json
{
  "routes": {}
}
```

---

# Configuration Reference

Current supported failure types:

| Failure      | Description                         |
| ------------ | ----------------------------------- |
| `http_error` | Return a configured HTTP error      |
| `latency`    | Delay the request before continuing |

More failure types are planned as Chaos Route evolves.

---

# Example Express Application

```js
import express from "express";
import { chaos } from "@priyabrat/chaos-route";

const app = express();

app.use(express.json());

app.use(chaos());

app.post("/api/login", (req, res) => {
  res.json({
    message: "Login successful"
  });
});

app.get("/api/users", (req, res) => {
  res.json([
    { id: 1, name: "John" },
    { id: 2, name: "Jane" }
  ]);
});

app.listen(5000, () => {
  console.log("Server running on port 5000");
});
```

With:

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "http_error",
        "status": 500,
        "message": "Something went wrong"
      }
    },

    "/api/users": {
      "failure": {
        "type": "latency",
        "latencyMs": 5000
      }
    }
  }
}
```

You can test how your application handles both failures without changing either controller.

---

# Important

Chaos Route is intended primarily for **development and testing**.

Avoid enabling failure configurations in production unless you explicitly understand the consequences.

A good practice is to use Chaos Route only in development/test environments.

---

# Roadmap

Planned failure types and features include:

* [ ] Timeout
* [ ] Random/probability-based failures
* [ ] Connection errors
* [ ] Rate limiting (`429`)
* [ ] Custom responses
* [ ] Request/response manipulation
* [ ] Better configuration validation
* [ ] Environment-based configuration
* [ ] More fault-injection strategies

---

# Contributing

Contributions, ideas, bug reports, and feature requests are welcome.

If you find a bug or have an idea for a new failure type, open an issue or submit a pull request.

---

# License
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

---

Built for developers who want to test what happens when their APIs **don't behave perfectly**.