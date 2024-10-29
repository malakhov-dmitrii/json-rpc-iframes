import { JsonRpcRequest, JsonRpcResponse, MethodHandler, Methods, Middleware } from './types';

export class Responder<T extends Methods> {
  private handlers: Map<keyof T, MethodHandler> = new Map();
  private middlewares: Middleware[] = [];
  private namespace: string;
  private targetOrigin: string;

  constructor(namespace: string, targetOrigin: string) {
    this.namespace = namespace;
    this.targetOrigin = targetOrigin;
    this.initialize();
  }

  private initialize() {
    window.addEventListener('message', async (event) => {
      if (event.origin !== this.targetOrigin) return;

      const request = event.data as JsonRpcRequest;
      if (!request || request.jsonrpc !== '2.0' || !request.method.startsWith(this.namespace)) {
        return;
      }

      const response: JsonRpcResponse = {
        jsonrpc: '2.0',
        id: request.id
      };

      try {
        const methodName = request.method.slice(this.namespace.length + 1);
        const handler = this.handlers.get(methodName as keyof T);

        if (!handler) {
          throw new Error(`Method ${methodName} not found`);
        }

        // Run middlewares
        for (const middleware of this.middlewares) {
          await middleware(methodName, request.params);
        }

        response.result = await handler(...request.params);
      } catch (error) {
        response.error = {
          code: -32000,
          message: error instanceof Error ? error.message : 'Internal error'
        };
      }

      event.source?.postMessage(response, { targetOrigin: this.targetOrigin });
    });
  }

  subscribe<K extends keyof T>(method: K, handler: T[K]) {
    this.handlers.set(method, handler);
  }

  use(middleware: Middleware) {
    this.middlewares.push(middleware);
  }
}