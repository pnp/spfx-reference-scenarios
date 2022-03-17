import { TimelinePipe } from "@pnp/core";
import { Queryable } from "@pnp/queryable";

export function Resovable<T = void>(): [Promise<T>, (value: T | PromiseLike<T>) => void, (reason?: any) => void] {

    let resolve: (value: T | PromiseLike<T>) => void;
    let reject: (reason?: any) => void;
    const promise = new Promise<T>((res, rej) => {
        resolve = res;
        reject = rej;
    });

    return [promise, resolve, reject];
};

const queueueueueMap: Map<string, Promise<void>[]> = new Map();

export function Blocking<T extends Queryable<any>>(key: string): TimelinePipe<T> {

    if (!queueueueueMap.has(key)) {
        queueueueueMap.set(key, []);
    }

    const queueueueue = queueueueueMap.get(key);

    const [promise, resolve] = Resovable();

    return (instance) => {

        instance.on.pre.prepend(async (url, init, result) => {

            // get next in line
            queueueueue.push(promise);

            // we want to leave in the one we just pushed
            const len = queueueueue.length - 1;
            for (let i = 0; i < len; i++) {

                // await for others in the line to complete
                await queueueueue.shift();
            }
            
            return [url, init, result];
        });

        instance.on.dispose(() => {

            resolve();
        });

        return instance;
    };
}

