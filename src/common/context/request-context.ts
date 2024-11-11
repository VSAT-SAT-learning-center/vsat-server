import { AsyncLocalStorage } from 'async_hooks';

export class RequestContext {
    private static asyncLocalStorage = new AsyncLocalStorage<Map<string, any>>();

    static run(context: Map<string, any>, callback: () => void) {
        RequestContext.asyncLocalStorage.run(context, callback);
    }

    static set(key: string, value: any) {
        const store = RequestContext.asyncLocalStorage.getStore();
        if (store) {
            store.set(key, value);
        }
    }

    static get(key: string) {
        const store = RequestContext.asyncLocalStorage.getStore();
        return store ? store.get(key) : undefined;
    }
}
