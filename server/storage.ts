import { expenses, splitSettings, categories, historicalExpenses, type Expense, type InsertExpense, type SplitSettings, type InsertSplitSettings, type Category, type InsertCategory, type HistoricalExpense, type InsertHistoricalExpense } from "@shared/schema";
import { db } from "./db";
import { eq, and } from "drizzle-orm";

export interface IStorage {
  // Expenses
  getExpenses(): Promise<Expense[]>;
  getExpense(id: number): Promise<Expense | undefined>;
  createExpense(expense: InsertExpense): Promise<Expense>;
  updateExpense(id: number, expense: Partial<InsertExpense>): Promise<Expense | undefined>;
  deleteExpense(id: number): Promise<boolean>;
  
  // Split Settings
  getSplitSettings(): Promise<SplitSettings>;
  updateSplitSettings(settings: InsertSplitSettings): Promise<SplitSettings>;
  
  // Categories
  getCategories(): Promise<Category[]>;
  createCategory(category: InsertCategory): Promise<Category>;
  updateCategory(id: number, category: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Historical Expenses
  getHistoricalExpenses(year: number): Promise<HistoricalExpense[]>;
  createHistoricalExpense(historicalExpense: InsertHistoricalExpense): Promise<HistoricalExpense>;
  updateHistoricalExpense(id: number, historicalExpense: Partial<InsertHistoricalExpense>): Promise<HistoricalExpense | undefined>;
  deleteHistoricalExpense(id: number): Promise<boolean>;
  
  // Bulk operations for database management
  deleteAllExpenses(): Promise<boolean>;
  deleteAllCategories(): Promise<boolean>;
}

export class DatabaseStorage implements IStorage {
  async getExpenses(): Promise<Expense[]> {
    const result = await db.select().from(expenses).orderBy(expenses.createdAt);
    return result;
  }

  async getExpense(id: number): Promise<Expense | undefined> {
    const [expense] = await db.select().from(expenses).where(eq(expenses.id, id));
    return expense || undefined;
  }

  async createExpense(insertExpense: InsertExpense): Promise<Expense> {
    const [expense] = await db
      .insert(expenses)
      .values({
        ...insertExpense,
        isVariable: insertExpense.isVariable ?? false,
      })
      .returning();
    return expense;
  }

  async updateExpense(id: number, updateData: Partial<InsertExpense>): Promise<Expense | undefined> {
    // Get the current expense before updating
    const currentExpense = await this.getExpense(id);
    
    // If amount or frequency changed, preserve historical data for trend calculation
    if (currentExpense && (updateData.amount !== undefined || updateData.frequency !== undefined)) {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      // Check if historical record exists for previous year
      const existingHistorical = await db
        .select()
        .from(historicalExpenses)
        .where(and(
          eq(historicalExpenses.expenseName, currentExpense.name),
          eq(historicalExpenses.year, previousYear)
        ));
      
      // If no historical record exists and this is a fixed expense, create one
      if (existingHistorical.length === 0 && !currentExpense.isVariable && !currentExpense.isIncome) {
        await this.createHistoricalExpense({
          expenseName: currentExpense.name,
          year: previousYear,
          amount: currentExpense.amount,
          frequency: currentExpense.frequency,
          category: currentExpense.category
        });
      }
    }

    const [expense] = await db
      .update(expenses)
      .set({
        ...updateData,
        updatedAt: new Date(),
      })
      .where(eq(expenses.id, id))
      .returning();
    return expense || undefined;
  }

  async deleteExpense(id: number): Promise<boolean> {
    const result = await db.delete(expenses).where(eq(expenses.id, id));
    return (result.rowCount || 0) > 0;
  }

  async getSplitSettings(): Promise<SplitSettings> {
    const [settings] = await db.select().from(splitSettings).orderBy(splitSettings.id).limit(1);
    if (!settings) {
      // Create default settings if none exist
      const [newSettings] = await db
        .insert(splitSettings)
        .values({
          user1Name: "You",
          user1Percentage: 60,
          user2Name: "Partner",
          user2Percentage: 40,
        })
        .returning();
      return newSettings;
    }
    return settings;
  }

  async updateSplitSettings(settings: InsertSplitSettings): Promise<SplitSettings> {
    const existing = await this.getSplitSettings();
    const [updated] = await db
      .update(splitSettings)
      .set({
        ...settings,
        updatedAt: new Date(),
      })
      .where(eq(splitSettings.id, existing.id))
      .returning();
    return updated;
  }

  async getCategories(): Promise<Category[]> {
    const result = await db.select().from(categories).orderBy(categories.name);
    if (result.length === 0) {
      // Initialize default categories
      const defaultCategories = [
        { name: "Housing", icon: "home", color: "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400" },
        { name: "Utilities", icon: "bolt", color: "bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400" },
        { name: "Transportation", icon: "car", color: "bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400" },
        { name: "Food & Groceries", icon: "utensils", color: "bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400" },
        { name: "Insurance", icon: "shield", color: "bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400" },
        { name: "Entertainment", icon: "play", color: "bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400" },
        { name: "Other", icon: "ellipsis-h", color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
      ];
      
      await db.insert(categories).values(defaultCategories);
      return await db.select().from(categories).orderBy(categories.name);
    }
    return result;
  }

  async createCategory(category: InsertCategory): Promise<Category> {
    const [newCategory] = await db
      .insert(categories)
      .values(category)
      .returning();
    return newCategory;
  }

  async updateCategory(id: number, updateData: Partial<InsertCategory>): Promise<Category | undefined> {
    const [category] = await db
      .update(categories)
      .set(updateData)
      .where(eq(categories.id, id))
      .returning();
    return category || undefined;
  }

  async deleteCategory(id: number): Promise<boolean> {
    const result = await db.delete(categories).where(eq(categories.id, id));
    return (result.rowCount || 0) > 0;
  }

  async deleteAllExpenses(): Promise<boolean> {
    try {
      await db.delete(expenses);
      return true;
    } catch (error) {
      console.error("Error deleting all expenses:", error);
      return false;
    }
  }

  async deleteAllCategories(): Promise<boolean> {
    try {
      await db.delete(categories);
      return true;
    } catch (error) {
      console.error("Error deleting all categories:", error);
      return false;
    }
  }

  async getHistoricalExpenses(year: number): Promise<HistoricalExpense[]> {
    const result = await db.select().from(historicalExpenses).where(eq(historicalExpenses.year, year));
    return result;
  }

  async createHistoricalExpense(insertHistoricalExpense: InsertHistoricalExpense): Promise<HistoricalExpense> {
    const [historicalExpense] = await db
      .insert(historicalExpenses)
      .values(insertHistoricalExpense)
      .returning();
    return historicalExpense;
  }

  async updateHistoricalExpense(id: number, updateData: Partial<InsertHistoricalExpense>): Promise<HistoricalExpense | undefined> {
    const [historicalExpense] = await db
      .update(historicalExpenses)
      .set(updateData)
      .where(eq(historicalExpenses.id, id))
      .returning();
    return historicalExpense || undefined;
  }

  async deleteHistoricalExpense(id: number): Promise<boolean> {
    try {
      const result = await db.delete(historicalExpenses).where(eq(historicalExpenses.id, id));
      return result.rowCount !== null && result.rowCount > 0;
    } catch (error) {
      console.error("Error deleting historical expense:", error);
      return false;
    }
  }
}



export const storage = new DatabaseStorage();
