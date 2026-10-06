export type TxType = "expense" | "income";

export interface Category {
  id?: number;
  name: string;
  icon: string;
  color: string;
  type: TxType;
}

export interface Expense {
  id?: number;
  amount: number;
  note?: string;
  categoryId: number;
  type: TxType;
  date: string;
  createdAt: string;
}

export interface User {
  id?: number;
  firstName: string;
  lastName: string;
  passwordHash: string;
  createdAt: string;
}
