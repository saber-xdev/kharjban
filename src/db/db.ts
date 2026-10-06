import Dexie, { type Table } from "dexie";
import type { Category, Expense, User } from "../types";

export class AppDB extends Dexie {
  categories!: Table<Category, number>;
  expenses!: Table<Expense, number>;
  users!: Table<User, number>;

  constructor() {
    super("khari-ban");
    this.version(1).stores({
      categories: "++id, name, type",
      expenses: "++id, date, categoryId, type, createdAt",
    });
    this.version(2).stores({
      categories: "++id, name, type",
      expenses: "++id, date, categoryId, type, createdAt",
      users: "++id, createdAt",
    });
  }
}

export const db = new AppDB();

export async function requestPersistentStorage() {
  if (navigator.storage?.persist) {
    const already = await navigator.storage.persisted();
    if (!already) await navigator.storage.persist();
  }
}
