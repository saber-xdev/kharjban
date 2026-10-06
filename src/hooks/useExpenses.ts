import { useLiveQuery } from "dexie-react-hooks";
import { db } from "../db/db";
import type { Expense } from "../types";

export function useExpenses() {
  return useLiveQuery(
    () => db.expenses.orderBy("date").reverse().toArray(),
    [],
    [] as Expense[]
  );
}

export function useMonthlyTotals() {
  return useLiveQuery(
    async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const items = await db.expenses.where("date").aboveOrEqual(start).toArray();

      let income = 0;
      let expense = 0;
      for (const e of items) {
        if (e.type === "income") income += e.amount;
        else expense += e.amount;
      }
      return { income, expense, balance: income - expense };
    },
    [],
    { income: 0, expense: 0, balance: 0 }
  );
}

// سازگاری با کد قدیم
export function useMonthlyTotal() {
  return useLiveQuery(
    async () => {
      const now = new Date();
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      const items = await db.expenses.where("date").aboveOrEqual(start).toArray();
      return items.filter((e) => e.type !== "income").reduce((s, e) => s + e.amount, 0);
    },
    [],
    0
  );
}
