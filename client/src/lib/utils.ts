import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(amount);
}

export function getMonthlyEquivalent(amount: number, frequency: string): number {
  switch (frequency) {
    case "quarterly":
      return amount / 3;
    case "semi-annually":
      return amount / 6;
    case "yearly":
      return amount / 12;
    case "one-time":
      return amount / 12; // Spread one-time payment over 12 months
    default:
      return amount;
  }
}

export function translateFrequency(frequency: string): string {
  const translations: Record<string, string> = {
    "monthly": "monatlich",
    "quarterly": "quartalsweise",
    "semi-annually": "halbjährlich",
    "yearly": "jährlich",
    "one-time": "einmalig"
  };
  return translations[frequency] || frequency;
}

export function getCategoryIcon(category: string): string {
  const iconMap: Record<string, string> = {
    // German categories from your data
    "Wohnkosten": "home",
    "Versicherungen": "shield",
    "Utilities & Energie": "zap",
    "Internet & TV": "wifi",
    "Fahrzeug": "car",
    "Lebensmittel": "shopping-cart",
    "Steuern": "file-text",
    "Wartung & Service": "wrench",
    "Einkommen": "plus-circle",
    "Rücklagen": "piggy-bank",
    
    // Legacy English categories for backward compatibility
    "Housing": "home",
    "Utilities": "bolt",
    "Transportation": "car",
    "Food & Groceries": "utensils",
    "Insurance": "shield",
    "Entertainment": "play",
    "Income": "trending-up",
    "Other": "ellipsis-h",
  };
  return iconMap[category] || "ellipsis-h";
}

// Helper function to get color classes from simple color names
export function getColorClasses(colorName: string): string {
  const colorMap: Record<string, string> = {
    "red": "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400",
    "blue": "bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400",
    "green": "bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400",
    "orange": "bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400",
    "purple": "bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400",
    "pink": "bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400",
    "yellow": "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400",
    "indigo": "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400",
    "emerald": "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400",
    "gray": "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
  };
  return colorMap[colorName] || "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400";
}

export function getCategoryColor(category: string): string {
  // Special handling for Income category - always light green
  if (category === "Einkommen" || category === "Income") {
    return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
  }
  
  // First check if it's already a color class string (backward compatibility)
  if (category.includes("bg-")) {
    return category;
  }
  
  // Handle simple color names from database
  return getColorClasses(category);
}

export function getExpenseIcon(expense: { icon?: string | null; category: string }): string {
  // Use expense-specific icon if available and not "default" or empty, otherwise fall back to category icon
  return (expense.icon && expense.icon !== "default" && expense.icon !== "") ? expense.icon : getCategoryIcon(expense.category);
}
