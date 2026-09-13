# Chaos Route
[![npm version](https://img.shields.io/npm/v/@priyabrat/chaos-route.svg)](https://www.npmjs.com/package/@priyabrat/chaos-route)

> Intentionally break your Express.js API routes to test how your application handles failures.

**Chaos Route** is an Express middleware package for controlled fault injection during development and testing.

It lets you configure failures for specific routes without modifying your controllers or frontend code.

For example, you can make `/api/login` timeout, return a `500` error, or introduce artificial latency simply by changing `chaos.config.json`.

---
## Table of Contents

* [Installation](#installation)

* [Quick Start](#quick-start)

  * [1. Add Chaos Route to your Express application](#1-add-chaos-route-to-your-express-application)

  * [2. Create `chaos.config.json`](#2-create-chaosconfigjson)

* [How It Works](#how-it-works)

* [Configuration](#configuration)

  * [HTTP Error](#http-error)

  * [Latency](#latency)

  * [Timeout](#timeout)

  * [Connection Error](#connection-error)

  * [Rate Limit](#rate-limit)

* [Request Manipulation](#request-manipulation)

  * [Add Request Fields](#add-request-fields)

  * [Modify Request Fields](#modify-request-fields)

  * [Remove Request Fields](#remove-request-fields)

* [Response Manipulation](#response-manipulation)

  * [Add Response Fields](#add-response-fields)

  * [Modify Response Fields](#modify-response-fields)

  * [Remove Response Fields](#remove-response-fields)

* [Multiple Routes](#multiple-routes)

* [Routes Without Chaos](#routes-without-chaos)

* [Disabling a Failure](#disabling-a-failure)

* [Configuration Reference](#configuration-reference)

* [Example Express Application](#example-express-application)

* [Version History](#version-history)

* [Important](#important)

* [Roadmap](#roadmap)

* [Contributing](#contributing)

* [License](#license)

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
| `latencyMs` | `number`    | `3000`  | Delay in milliseconds |

---

## Timeout

Simulate a request that hangs for a specified duration and then terminates the connection.

```json
{
  "routes": {
    "/api/users": {
      "failure": {
        "type": "timeout",
        "timeoutMs": 3000
      }
    }
  }
}
```

A request to `/api/users` will hang for 3 seconds and then the connection will be terminated.

### Options

| Option      | Type        | Default | Description                              |
| ----------- | ----------- | ------- | ---------------------------------------- |
| `type`      | `"timeout"` | —       | Failure type                             |
| `timeoutMs` | `number`    | `5000`  | Time before the connection is terminated |

---

## Connection Error

Immediately terminate the connection to simulate a connection failure.

```json
{
  "routes": {
    "/api/users": {
      "failure": {
        "type": "connection_error"
      }
    }
  }
}
````

A request to `/api/users` will have its connection terminated without receiving a response.

### Options

| Option | Type                 | Default | Description  |
| ------ | -------------------- | ------- | ------------ |
| `type` | `"connection_error"` | —       | Failure type |

---

## Rate Limit

Limit requests to an endpoint and return `429` when the limit is exceeded.

```json
{
  "routes": {
    "/api/login": {
      "failure": {
        "type": "rate_limit",
        "limit": 5,
        "windowMs": 60000
      }
    }
  }
}
````

After 5 requests within 60 seconds, further requests will receive a `429 Too Many Requests` response.

### Options

| Option     | Type           | Default | Description                 |
| ---------- | -------------- | ------- | --------------------------- |
| `type`     | `"rate_limit"` | —       | Failure type                |
| `limit`    | `number`       | `10`     | Maximum requests allowed    |
| `windowMs` | `number`       | `60000` | Time window in milliseconds |

---

## Request Manipulation

Modify, add, or remove request fields before they reach your controller.

```json
{
  "routes": {
    "/api/profile": {
      "request": {
        "remove": ["email"],
        "set": {
          "age": 99
        },
        "add": {
          "chaosTest": true
        }
      }
    }
  }
}
````

### Add Request Fields

Use `add` to add fields to the request.

```json
"add": {
  "chaosTest": true
}
```

### Modify Request Fields

Use `set` to modify existing request fields.

```json
"set": {
  "age": 99
}
```

### Remove Request Fields

Use `remove` to remove fields from the request.

```json
"remove": ["email"]
```

The modified request is then passed to your existing controller.

---

## Response Manipulation

Modify, add, or remove response fields before they reach the client.

```json
{
  "routes": {
    "/api/profile": {
      "response": {
        "remove": ["email"],
        "set": {
          "age": 99
        },
        "add": {
          "chaosTest": true
        }
      }
    }
  }
}
````

### Add Response Fields

Use `add` to add fields to the response.

```json
"add": {
  "chaosTest": true
}
```

### Modify Response Fields

Use `set` to modify existing response fields.

```json
"set": {
  "age": 99
}
```

### Remove Response Fields

Use `remove` to remove fields from the response.

```json
"remove": ["email"]
```

The modified response is then sent to the client.

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
| `connection_error`    | Destoy the connection |
| `timeout`    | hangs req for specific period then terminates connection |
| `rate_limit`    | Limit requests to an endpoint and return 429 when the limit is exceeded. |

Supported manipulation:

| type      | Description                         |
| ------------ | ----------------------------------- |
| `request` | Modify, add, or remove request fields before they reach your controller. |
| `response`    | Modify, add, or remove request fields before they reach to client. |


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

## Version History

### [![Version](https://img.shields.io/badge/version-0.0.3-blue)](https://www.npmjs.com/package/@priyabrat/chaos-route) - Current

**Request/Response Manipulation**

Add request/response fields
Modify request/response fields
Remove request/response fields

### [![Version](https://img.shields.io/badge/version-0.0.2-blue)](https://www.npmjs.com/package/@priyabrat/chaos-route) 

**Failure Injection**

* [x] Timeout
* [x] Connection errors
* [x] Rate limiting (`429`)

---

### [![Version](https://img.shields.io/badge/version-0.0.1-blue)](https://www.npmjs.com/package/@priyabrat/chaos-route) — Initial Release

* [x] HTTP errors
* [x] Latency injection

---

# Important

Chaos Route is intended primarily for **development and testing**.

Avoid enabling failure configurations in production unless you explicitly understand the consequences.

A good practice is to use Chaos Route only in development/test environments.

---

# Roadmap

Planned failure types and features include:

* [x] Timeout
* [x] Connection errors
* [x] Rate limiting (`429`)
* [ ] Custom responses
* [x] Request/response manipulation
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