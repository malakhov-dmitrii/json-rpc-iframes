export class Responder {
    constructor(namespace, targetOrigin) {
        this.handlers = new Map();
        this.middlewares = [];
        this.namespace = namespace;
        this.targetOrigin = targetOrigin;
        this.initialize();
    }
    initialize() {
        window.addEventListener('message', async (event) => {
            if (event.origin !== this.targetOrigin)
                return;
            const request = event.data;
            if (!request || request.jsonrpc !== '2.0' || !request.method.startsWith(this.namespace)) {
                return;
            }
            const response = {
                jsonrpc: '2.0',
                id: request.id
            };
            try {
                const methodName = request.method.slice(this.namespace.length + 1);
                const handler = this.handlers.get(methodName);
                if (!handler) {
                    throw new Error(`Method ${methodName} not found`);
                }
                // Run middlewares
                for (const middleware of this.middlewares) {
                    await middleware(methodName, request.params);
                }
                response.result = await handler(...request.params);
            }
            catch (error) {
                response.error = {
                    code: -32000,
                    message: error instanceof Error ? error.message : 'Internal error'
                };
            }
            event.source?.postMessage(response, { targetOrigin: this.targetOrigin });
        });
    }
    subscribe(method, handler) {
        this.handlers.set(method, handler);
    }
    use(middleware) {
        this.middlewares.push(middleware);
    }
}
