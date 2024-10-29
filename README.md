# jsonrpc-iframe

A type-safe JSON-RPC implementation for secure iframe communication.

## Features

- Full TypeScript support with type inference
- JSON-RPC 2.0 compliant
- Secure cross-origin communication
- Promise-based API
- Proxy support for method calls
- Middleware support

## Installation

```bash
npm install jsonrpc-iframe
```

## Usage

### In the parent window:

```typescript
import { Requester } from 'jsonrpc-iframe';

type APIMethods = {
  echo: (message: string) => string;
  add: (a: number, b: number) => number;
};

const requester = new Requester<APIMethods>('api', 'https://iframe-domain.com');

// Method-style calls
const result1 = await requester.call('add', 2, 3);

// Proxy-style calls
const result2 = await requester.proxy.echo('Hello!');
```

### In the iframe:

```typescript
import { Responder } from 'jsonrpc-iframe';

type APIMethods = {
  echo: (message: string) => string;
  add: (a: number, b: number) => number;
};

const responder = new Responder<APIMethods>('api', 'https://parent-domain.com');

// Register method handlers
responder.subscribe('echo', (message) => message);
responder.subscribe('add', (a, b) => a + b);

// Add middleware
responder.use((method, params) => {
  console.log(`Called ${method} with params:`, params);
});
```

## Security

Always specify the target origin when creating Requesters and Responders to prevent XSS attacks.

## License

MIT