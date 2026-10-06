import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";

export function useCategories() {
  return useLiveQuery(() => db.categories.toArray(), [], []);
}
