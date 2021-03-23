/**
 * KeyValue - helper class for page side scripts that need key/value storage.
 * This class has only static helper methods for the client side.
 * background.ts uses KeyValueStore to actually to IndexedDB based storage.
 */

export class KeyValue {

    /**
     * Retrieve the value of a key from the key/value store
     * @param key The key to get from the key/value sture
     * @returns The value belonging to the key, or undefined if the key was not found
     */
    public static GetValue(key: string): Promise<string> {
        return new Promise<string>((resolve, reject) => {
            chrome.runtime.sendMessage({ getValueForKey: key }, (res: object) => {
                resolve(res.toString());
            });
        });
    }

    /**
     * Set a value in the key/value store
     * @param key The key to set a new value for in the key/value store
     * @param value The value to set
     * @returns A boolean indicating if the operation was a success
     */
    public static async SetValue(key: string, value: string): Promise<boolean> {
        return new Promise<boolean>((resolve, reject) => {
            chrome.runtime.sendMessage({ setValueForKey: key, value }, (res: boolean) => {
                resolve(res);
            })
        });
    }
}