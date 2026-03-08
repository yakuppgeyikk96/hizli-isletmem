import { pgTable, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { businessTypeEnum } from "./enums";

export const businesses = pgTable("businesses", {
  id: uuid().primaryKey().defaultRandom(),
  name: text().notNull(),
  type: businessTypeEnum().notNull(),
  phone: text(),
  address: text(),
  currency: text().notNull().default("TRY"),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow()
    .$onUpdate(() => new Date()),
});
