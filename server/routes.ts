import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertExpenseSchema, insertSplitSettingsSchema, insertCategorySchema } from "@shared/schema";
import { z } from "zod";

export async function registerRoutes(app: Express): Promise<Server> {
  // Get all expenses
  app.get("/api/expenses", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      res.json(expenses);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expenses" });
    }
  });

  // Get single expense
  app.get("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const expense = await storage.getExpense(id);
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch expense" });
    }
  });

  // Create new expense
  app.post("/api/expenses", async (req, res) => {
    try {
      const validatedData = insertExpenseSchema.parse(req.body);
      const expense = await storage.createExpense(validatedData);
      res.status(201).json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create expense" });
    }
  });

  // Update expense
  app.put("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const validatedData = insertExpenseSchema.partial().parse(req.body);
      const expense = await storage.updateExpense(id, validatedData);
      
      if (!expense) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.json(expense);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid expense data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update expense" });
    }
  });

  // Delete expense
  app.delete("/api/expenses/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid expense ID" });
      }

      const deleted = await storage.deleteExpense(id);
      if (!deleted) {
        return res.status(404).json({ message: "Expense not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete expense" });
    }
  });

  // Get split settings
  app.get("/api/split-settings", async (req, res) => {
    try {
      const settings = await storage.getSplitSettings();
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch split settings" });
    }
  });

  // Update split settings
  app.put("/api/split-settings", async (req, res) => {
    try {
      const validatedData = insertSplitSettingsSchema.parse(req.body);
      const settings = await storage.updateSplitSettings(validatedData);
      res.json(settings);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid split settings data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update split settings" });
    }
  });

  // Get all categories
  app.get("/api/categories", async (req, res) => {
    try {
      const categories = await storage.getCategories();
      res.json(categories);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch categories" });
    }
  });

  // Create new category
  app.post("/api/categories", async (req, res) => {
    try {
      const validatedData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(validatedData);
      res.status(201).json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to create category" });
    }
  });

  // Update category
  app.put("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const validatedData = insertCategorySchema.partial().parse(req.body);
      const category = await storage.updateCategory(id, validatedData);
      
      if (!category) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.json(category);
    } catch (error) {
      if (error instanceof z.ZodError) {
        return res.status(400).json({ message: "Invalid category data", errors: error.errors });
      }
      res.status(500).json({ message: "Failed to update category" });
    }
  });

  // Delete category
  app.delete("/api/categories/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      if (isNaN(id)) {
        return res.status(400).json({ message: "Invalid category ID" });
      }

      const deleted = await storage.deleteCategory(id);
      if (!deleted) {
        return res.status(404).json({ message: "Category not found" });
      }

      res.status(204).send();
    } catch (error) {
      res.status(500).json({ message: "Failed to delete category" });
    }
  });

  // Get dashboard analytics
  app.get("/api/analytics", async (req, res) => {
    try {
      const year = req.query.year ? parseInt(req.query.year as string) : new Date().getFullYear();
      const isCurrentYear = year === new Date().getFullYear();
      
      let expenses;
      if (isCurrentYear) {
        expenses = await storage.getExpenses();
      } else {
        // Transform historical data to match expense structure
        const historicalData = await storage.getHistoricalExpenses(year);
        expenses = historicalData.map(h => ({
          id: h.id,
          name: h.expenseName,
          amount: h.amount,
          frequency: h.frequency,
          category: h.category,
          isVariable: false, // Historical data is always fixed expenses
          isIncome: false,
          icon: "receipt",
          imageUrl: null,
          variableMonth: null,
          variableYear: null,
          createdAt: h.createdAt,
          updatedAt: h.createdAt,
        }));
      }
      
      const splitSettings = await storage.getSplitSettings();
      const categories = await storage.getCategories();

      // Calculate monthly equivalents - variable expenses only count for their specific month
      const currentMonth = new Date().getMonth() + 1; // 1-12
      const currentYear = new Date().getFullYear();
      
      const monthlyTotal = expenses.reduce((total, expense) => {
        // For historical data (not current year), all expenses are treated as fixed
        if (!isCurrentYear) {
          let monthlyAmount = expense.amount;
          if (expense.frequency === "quarterly") {
            monthlyAmount = expense.amount / 3;
          } else if (expense.frequency === "semi-annually" || expense.frequency === "halbjährlich") {
            monthlyAmount = expense.amount / 6;
          } else if (expense.frequency === "yearly" || expense.frequency === "jährlich") {
            monthlyAmount = expense.amount / 12;
          } else if (expense.frequency === "one-time") {
            monthlyAmount = expense.amount / 12;
          }
          return total + monthlyAmount;
        }
        
        // For current year variable expenses, only include if it's for the current month/year
        if (expense.isVariable) {
          if (expense.variableMonth === currentMonth && expense.variableYear === currentYear) {
            return total + expense.amount;
          }
          return total;
        }
        
        // For current year fixed expenses, calculate monthly equivalent
        let monthlyAmount = expense.amount;
        if (expense.frequency === "quarterly") {
          monthlyAmount = expense.amount / 3;
        } else if (expense.frequency === "semi-annually") {
          monthlyAmount = expense.amount / 6;
        } else if (expense.frequency === "yearly") {
          monthlyAmount = expense.amount / 12;
        } else if (expense.frequency === "one-time") {
          monthlyAmount = expense.amount / 12;
        }
        return total + monthlyAmount;
      }, 0);

      const user1Share = (monthlyTotal * splitSettings.user1Percentage) / 100;
      const user2Share = (monthlyTotal * splitSettings.user2Percentage) / 100;

      // Monthly trend data - variable costs only in their specific month, fixed costs throughout year
      const monthNames = ["Jan", "Feb", "Mar", "Apr", "Mai", "Jun", "Jul", "Aug", "Sep", "Okt", "Nov", "Dez"];
      
      // Calculate fixed monthly total (consistent across all months)
      const fixedMonthlyTotal = expenses.reduce((total, expense) => {
        // For historical data, all expenses are treated as fixed
        if (!isCurrentYear) {
          let monthlyAmount = expense.amount;
          if (expense.frequency === "quarterly") {
            monthlyAmount = expense.amount / 3;
          } else if (expense.frequency === "semi-annually" || expense.frequency === "halbjährlich") {
            monthlyAmount = expense.amount / 6;
          } else if (expense.frequency === "yearly" || expense.frequency === "jährlich") {
            monthlyAmount = expense.amount / 12;
          } else if (expense.frequency === "one-time") {
            monthlyAmount = expense.amount / 12;
          }
          return total + monthlyAmount;
        }
        
        if (expense.isVariable) return total;
        
        let monthlyAmount = expense.amount;
        if (expense.frequency === "quarterly") {
          monthlyAmount = expense.amount / 3;
        } else if (expense.frequency === "semi-annually") {
          monthlyAmount = expense.amount / 6;
        } else if (expense.frequency === "yearly") {
          monthlyAmount = expense.amount / 12;
        } else if (expense.frequency === "one-time") {
          monthlyAmount = expense.amount / 12;
        }
        return total + monthlyAmount;
      }, 0);
      
      // Calculate year-over-year comparison for fixed costs using database historical data
      const currentFixedTotal = fixedMonthlyTotal;
      const comparisonYear = year - 1; // Compare to the year before the selected year
      
      // Get historical expenses for comparison year
      const historicalExpenses = await storage.getHistoricalExpenses(comparisonYear);
      
      const previousYearFixedTotal = historicalExpenses.reduce((total, historicalExpense) => {
        let monthlyAmount = historicalExpense.amount;
        if (historicalExpense.frequency === "quarterly") {
          monthlyAmount = historicalExpense.amount / 3;
        } else if (historicalExpense.frequency === "semi-annually" || historicalExpense.frequency === "halbjährlich") {
          monthlyAmount = historicalExpense.amount / 6;
        } else if (historicalExpense.frequency === "yearly" || historicalExpense.frequency === "jährlich") {
          monthlyAmount = historicalExpense.amount / 12;
        } else if (historicalExpense.frequency === "one-time") {
          monthlyAmount = historicalExpense.amount / 12;
        }
        return total + monthlyAmount;
      }, 0);
      
      const fixedCostsTrend = previousYearFixedTotal > 0 
        ? ((currentFixedTotal - previousYearFixedTotal) / previousYearFixedTotal) * 100 
        : 0;
      
      const monthlyTrend = monthNames.map((month, index) => {
        const monthNumber = index + 1;
        
        // For historical years, get data from historical_expenses table
        if (year < currentYear) {
          // Get historical variable expenses for this specific month/year
          const historicalVariableForMonth = historicalExpenses.reduce((total, historicalExpense) => {
            // Assuming historical expenses with variableMonth and variableYear would be stored if we had them
            // For now, historical data is mostly fixed costs, so variable is 0
            return total;
          }, 0);
          
          return {
            month,
            amount: Math.round((fixedMonthlyTotal + historicalVariableForMonth) * 100) / 100
          };
        }
        
        // For current year, use current expenses
        const variableForMonth = expenses.reduce((total, expense) => {
          if (!expense.isVariable) return total;
          if (expense.variableMonth === monthNumber && expense.variableYear === year) {
            return total + expense.amount;
          }
          return total;
        }, 0);
        
        return {
          month,
          amount: Math.round((fixedMonthlyTotal + variableForMonth) * 100) / 100
        };
      });

      res.json({
        monthlyTotal: Math.round(monthlyTotal * 100) / 100,
        user1Share: Math.round(user1Share * 100) / 100,
        user2Share: Math.round(user2Share * 100) / 100,
        user1Name: splitSettings.user1Name,
        user2Name: splitSettings.user2Name,
        user1ProfileImage: splitSettings.user1ProfileImage,
        user2ProfileImage: splitSettings.user2ProfileImage,
        activeExpenses: expenses.length,
        monthlyTrend,
        fixedCostsTotal: Math.round(currentFixedTotal * 100) / 100,
        fixedCostsTrend: Math.round(fixedCostsTrend * 100) / 100,
        splitData: (() => {
          const categoryTotals = expenses
            .filter(expense => !expense.isIncome) // Exclude income from pie chart
            .reduce((acc, expense) => {
              // For variable expenses, only include if it's for the current month/year
              if (expense.isVariable) {
                if (expense.variableMonth === currentMonth && expense.variableYear === currentYear) {
                  acc[expense.category] = (acc[expense.category] || 0) + expense.amount;
                }
                return acc; // Skip variable expenses not for current month
              }
              
              // For fixed expenses, calculate monthly equivalent
              let monthlyAmount = expense.amount;
              if (expense.frequency === "quarterly") {
                monthlyAmount = expense.amount / 3;
              } else if (expense.frequency === "semi-annually") {
                monthlyAmount = expense.amount / 6;
              } else if (expense.frequency === "yearly") {
                monthlyAmount = expense.amount / 12;
              } else if (expense.frequency === "one-time") {
                monthlyAmount = expense.amount / 12;
              }
              
              acc[expense.category] = (acc[expense.category] || 0) + monthlyAmount;
              return acc;
            }, {} as Record<string, number>);

          // Calculate total expenses (excluding income) for percentage calculation
          const expenseTotal = Object.values(categoryTotals).reduce((sum, amount) => sum + amount, 0);

          // Create a map of category names to colors
          const categoryColorMap = categories.reduce((acc, cat) => {
            acc[cat.name] = cat.color;
            return acc;
          }, {} as Record<string, string>);

          return Object.entries(categoryTotals).map(([category, amount]) => ({
            name: category,
            value: Math.round((amount / expenseTotal) * 100),
            amount: Math.round(amount * 100) / 100,
            color: categoryColorMap[category] || "gray"
          }));
        })(),
      });
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch analytics" });
    }
  });

  // Historical expenses routes
  app.get("/api/historical-expenses/:year", async (req, res) => {
    try {
      const year = parseInt(req.params.year);
      const historicalExpenses = await storage.getHistoricalExpenses(year);
      res.json(historicalExpenses);
    } catch (error) {
      console.error("Error fetching historical expenses:", error);
      res.status(500).json({ error: "Failed to fetch historical expenses" });
    }
  });

  // Year transition endpoint - creates historical snapshots for new year
  app.post("/api/year-transition", async (req, res) => {
    try {
      const currentYear = new Date().getFullYear();
      const previousYear = currentYear - 1;
      
      // Get all current fixed expenses (not variable, not income)
      const currentExpenses = await storage.getExpenses();
      const fixedExpenses = currentExpenses.filter(expense => 
        !expense.isVariable && !expense.isIncome
      );
      
      // Check which expenses don't have historical records for previous year
      for (const expense of fixedExpenses) {
        const existingHistorical = await storage.getHistoricalExpenses(previousYear);
        const hasRecord = existingHistorical.some(h => h.expenseName === expense.name);
        
        if (!hasRecord) {
          await storage.createHistoricalExpense({
            expenseName: expense.name,
            year: previousYear,
            amount: expense.amount,
            frequency: expense.frequency,
            category: expense.category
          });
        }
      }
      
      res.json({ success: true, message: `Historical data preserved for ${previousYear}` });
    } catch (error) {
      console.error("Error during year transition:", error);
      res.status(500).json({ error: "Failed to create year transition" });
    }
  });

  // Database management routes
  app.get("/api/database/export", async (req, res) => {
    try {
      const expenses = await storage.getExpenses();
      const splitSettings = await storage.getSplitSettings();
      const categories = await storage.getCategories();
      
      // Get all historical expenses for all years
      const currentYear = new Date().getFullYear();
      const years = Array.from({ length: 5 }, (_, i) => currentYear - i); // Export last 5 years
      const allHistoricalExpenses = [];
      
      for (const year of years) {
        const yearExpenses = await storage.getHistoricalExpenses(year);
        allHistoricalExpenses.push(...yearExpenses);
      }
      
      const exportData = {
        expenses,
        splitSettings,
        categories,
        historicalExpenses: allHistoricalExpenses,
        exportDate: new Date().toISOString(),
        version: "1.0.0"
      };
      
      res.setHeader('Content-Type', 'application/json');
      res.setHeader('Content-Disposition', 'attachment; filename="expense-tracker-backup.json"');
      res.json(exportData);
    } catch (error) {
      console.error("Error exporting database:", error);
      res.status(500).json({ error: "Failed to export database" });
    }
  });

  app.post("/api/database/import", async (req, res) => {
    try {
      const { expenses, splitSettings, categories, historicalExpenses } = req.body;
      
      // Clear existing data
      await storage.deleteAllExpenses();
      await storage.deleteAllCategories();
      
      // Import categories first
      if (categories && Array.isArray(categories)) {
        for (const category of categories) {
          await storage.createCategory({
            name: category.name,
            icon: category.icon,
            color: category.color
          });
        }
      }
      
      // Import expenses
      if (expenses && Array.isArray(expenses)) {
        for (const expense of expenses) {
          await storage.createExpense({
            name: expense.name,
            amount: expense.amount,
            frequency: expense.frequency,
            category: expense.category,
            isVariable: expense.isVariable,
            isIncome: expense.isIncome,
            icon: expense.icon,
            imageUrl: expense.imageUrl
          });
        }
      }
      
      // Import historical expenses
      if (historicalExpenses && Array.isArray(historicalExpenses)) {
        for (const historicalExpense of historicalExpenses) {
          await storage.createHistoricalExpense({
            expenseName: historicalExpense.expenseName,
            year: historicalExpense.year,
            amount: historicalExpense.amount,
            frequency: historicalExpense.frequency,
            category: historicalExpense.category
          });
        }
      }
      
      // Import split settings
      if (splitSettings) {
        await storage.updateSplitSettings({
          user1Name: splitSettings.user1Name,
          user1Percentage: splitSettings.user1Percentage,
          user2Name: splitSettings.user2Name,
          user2Percentage: splitSettings.user2Percentage
        });
      }
      
      res.json({ message: "Database imported successfully" });
    } catch (error) {
      console.error("Error importing database:", error);
      res.status(500).json({ error: "Failed to import database" });
    }
  });

  app.delete("/api/database/clear", async (req, res) => {
    try {
      await storage.deleteAllExpenses();
      await storage.deleteAllCategories();
      
      // Reset split settings to defaults
      await storage.updateSplitSettings({
        user1Name: "User 1",
        user1Percentage: 50,
        user2Name: "User 2", 
        user2Percentage: 50
      });
      
      res.json({ message: "Datenbank erfolgreich geleert" });
    } catch (error) {
      console.error("Error clearing database:", error);
      res.status(500).json({ error: "Fehler beim Leeren der Datenbank" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
