import { openDB } from 'idb';

export const dbPromise = openDB('dayflowDB', 1, {
    upgrade(db) {
        db.createObjectStore('offlineActions', {
            keyPath: 'id',
            autoIncrement: true,
        });
    },
});
