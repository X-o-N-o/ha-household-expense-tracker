import { sqliteTable, text, integer, real, blob } from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const expenses = sqliteTable("expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  amount: real("amount").notNull(),
  frequency: text("frequency").notNull(), // 'monthly' | 'quarterly' | 'yearly'
  category: text("category").notNull(),
  isVariable: integer("is_variable", { mode: 'boolean' }).notNull().default(false),
  isIncome: integer("is_income", { mode: 'boolean' }).notNull().default(false),
  icon: text("icon").default("receipt"),
  imageUrl: text("image_url"),
  variableMonth: integer("variable_month"), // Month (1-12) for variable expenses
  variableYear: integer("variable_year"), // Year for variable expenses
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const splitSettings = sqliteTable("split_settings", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  user1Name: text("user1_name").notNull().default("You"),
  user1Percentage: integer("user1_percentage").notNull().default(50),
  user1ProfileImage: text("user1_profile_image"),
  user2Name: text("user2_name").notNull().default("Partner"),
  user2Percentage: integer("user2_percentage").notNull().default(50),
  user2ProfileImage: text("user2_profile_image"),
  updatedAt: integer("updated_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull().unique(),
  icon: text("icon").notNull().default("ellipsis-h"),
  color: text("color").notNull().default("bg-gray-100 text-gray-500"),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const historicalExpenses = sqliteTable("historical_expenses", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  expenseName: text("expense_name").notNull(),
  year: integer("year").notNull(),
  amount: real("amount").notNull(),
  frequency: text("frequency").notNull(),
  category: text("category").notNull(),
  createdAt: integer("created_at", { mode: 'timestamp' }).notNull().$defaultFn(() => new Date()),
});

export const insertExpenseSchema = createInsertSchema(expenses).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertSplitSettingsSchema = createInsertSchema(splitSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
  createdAt: true,
});

export const insertHistoricalExpenseSchema = createInsertSchema(historicalExpenses).omit({
  id: true,
  createdAt: true,
});

export type InsertExpense = z.infer<typeof insertExpenseSchema>;
export type Expense = typeof expenses.$inferSelect;
export type InsertSplitSettings = z.infer<typeof insertSplitSettingsSchema>;
export type SplitSettings = typeof splitSettings.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;
export type Category = typeof categories.$inferSelect;
export type InsertHistoricalExpense = z.infer<typeof insertHistoricalExpenseSchema>;
export type HistoricalExpense = typeof historicalExpenses.$inferSelect;