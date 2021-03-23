import { get, set } from 'idb-keyval';

/**
 * KeyValueStore - A class that stores and retrieves key/value pairs.
 * Based on IndexedDB in order to support large values.
 * This class is only to be used by the background.ts script!
 * There is a separate helper class for page side activity, KeyValue.ts
 */

export class KeyValueStore {

    private static _instance: KeyValueStore = null;

    public static get Instance(): KeyValueStore {
        if(this._instance == null) {
            this._instance = new KeyValueStore();
        }
        return this._instance;
    }

    private constructor() {
        this.init();
    }

    private init() {
        // To be implemented
    }

    public GetValue(key: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            get(key).then(value => {
                resolve(value);
            })
            .catch(reason => {
                reject(reason);
            });
        });
    }

    public async SetValue(key: string, value: string): Promise<boolean> {
        try {
            await set(key, value);
            return true;
        } catch (e) {
            return false;
        }
    }
}