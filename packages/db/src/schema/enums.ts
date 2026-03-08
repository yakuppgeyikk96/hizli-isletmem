import { pgEnum } from "drizzle-orm/pg-core";

export const businessTypeEnum = pgEnum("business_type", [
  "restaurant",
  "cafe",
  "bar",
  "patisserie",
  "other",
]);

export const userRoleEnum = pgEnum("user_role", [
  "admin",
  "manager",
  "waiter",
  "cashier",
]);
