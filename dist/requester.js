export class Requester {
    constructor(namespace, targetOrigin, target = window.parent) {
        this.counter = 0;
        this.pending = new Map();
        this.namespace = namespace;
        this.targetOrigin = targetOrigin;
        this.target = target;
        this.initialize();
    }
    initialize() {
        window.addEventListener('message', (event) => {
            if (event.origin !== this.targetOrigin)
                return;
            const response = event.data;
            if (!response || response.jsonrpc !== '2.0' || typeof response.id !== 'number') {
                return;
            }
            const pending = this.pending.get(response.id);
            if (!pending)
                return;
            this.pending.delete(response.id);
            if (response.error) {
                pending.reject(new Error(response.error.message));
            }
            else {
                pending.resolve(response.result);
            }
        });
    }
    async call(method, ...params) {
        const id = this.counter++;
        const request = {
            jsonrpc: '2.0',
            method: `${this.namespace}.${String(method)}`,
            params,
            id
        };
        return new Promise((resolve, reject) => {
            this.pending.set(id, { resolve, reject });
            this.target.postMessage(request, { targetOrigin: this.targetOrigin });
        });
    }
    get proxy() {
        return new Proxy({}, {
            get: (_, method) => {
                return (...params) => this.call(method, ...params);
            }
        });
    }
}
