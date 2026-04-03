import { ChatSession } from "@/types/chat";

const DB_NAME = "chatbot_db";
const DB_VERSION = 1;
const STORE_NAME = "chat_sessions";

function openDb(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, DB_VERSION);
    req.onupgradeneeded = () => {
      const db = req.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        const store = db.createObjectStore(STORE_NAME, { keyPath: "id" });
        store.createIndex("updatedAt", "updatedAt", { unique: false });
      }
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

function txStore(mode: IDBTransactionMode): Promise<IDBObjectStore> {
  return openDb().then((db) => {
    const tx = db.transaction(STORE_NAME, mode);
    return tx.objectStore(STORE_NAME);
  });
}

export const chatDb = {
  async save(session: ChatSession): Promise<void> {
    const store = await txStore("readwrite");
    return new Promise((resolve, reject) => {
      const req = store.put(session);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async get(id: string): Promise<ChatSession | undefined> {
    const store = await txStore("readonly");
    return new Promise((resolve, reject) => {
      const req = store.get(id);
      req.onsuccess = () => resolve(req.result as ChatSession | undefined);
      req.onerror = () => reject(req.error);
    });
  },

  async getAll(): Promise<ChatSession[]> {
    const store = await txStore("readonly");
    return new Promise((resolve, reject) => {
      const req = store.index("updatedAt").openCursor(null, "prev");
      const results: ChatSession[] = [];
      req.onsuccess = () => {
        const cursor = req.result;
        if (cursor) {
          results.push(cursor.value as ChatSession);
          cursor.continue();
        } else {
          resolve(results);
        }
      };
      req.onerror = () => reject(req.error);
    });
  },

  async remove(id: string): Promise<void> {
    const store = await txStore("readwrite");
    return new Promise((resolve, reject) => {
      const req = store.delete(id);
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },

  async clear(): Promise<void> {
    const store = await txStore("readwrite");
    return new Promise((resolve, reject) => {
      const req = store.clear();
      req.onsuccess = () => resolve();
      req.onerror = () => reject(req.error);
    });
  },
};
