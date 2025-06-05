import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/sidebar";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { SplitPieChart } from "@/components/charts/split-pie-chart";
import { formatCurrency, getCategoryIcon, getCategoryColor, getExpenseIcon, getColorClasses } from "@/lib/utils";
import { TrendingUp, TrendingDown, Calendar, Download, Home, Car, Utensils, Heart, Zap, Shield, Receipt, Coffee, Gift, Phone, Wifi, CreditCard, ShoppingCart, Plane, Book, Music, Gamepad, Shirt, Baby, PawPrint, Wrench, Briefcase, GraduationCap, MapPin, Users, Star, Check, Bell, Clock, Lightbulb, Target, Award, Flag, Camera, Headphones, Monitor, Gamepad2, Palette, Scissors, Hammer, Truck, Bike, Train, Bus, Fuel, Banknote, PiggyBank, Calculator, FileText, Clipboard, Folder, Mail, Globe, Lock, Key, Settings, HelpCircle, Info, AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Play } from "lucide-react";
import type { Expense, Category } from "@shared/schema";

interface AnalyticsData {
  monthlyTotal: number;
  user1Share: number;
  user2Share: number;
  activeExpenses: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
  splitData: Array<{ name: string; value: number; amount: number }>;
}

export default function AnalyticsPage() {
  const [activeTab, setActiveTab] = useState("analytics");
  const [selectedPeriod, setSelectedPeriod] = useState("12months");

  // Icon mapping for Lucide React icons
  const iconMap: Record<string, any> = {
    home: Home,
    car: Car,
    utensils: Utensils,
    heart: Heart,
    bolt: Zap,
    shield: Shield,
    receipt: Receipt,
    coffee: Coffee,
    "trending-up": TrendingUp,
    gift: Gift,
    phone: Phone,
    wifi: Wifi,
    "credit-card": CreditCard,
    "shopping-cart": ShoppingCart,
    plane: Plane,
    book: Book,
    music: Music,
    gamepad: Gamepad,
    shirt: Shirt,
    baby: Baby,
    "paw-print": PawPrint,
    wrench: Wrench,
    briefcase: Briefcase,
    "graduation-cap": GraduationCap,
    "map-pin": MapPin,
    calendar: Calendar,
    users: Users,
    star: Star,
    check: Check,
    bell: Bell,
    clock: Clock,
    lightbulb: Lightbulb,
    target: Target,
    award: Award,
    flag: Flag,
    camera: Camera,
    headphones: Headphones,
    monitor: Monitor,
    palette: Palette,
    scissors: Scissors,
    hammer: Hammer,
    truck: Truck,
    bike: Bike,
    train: Train,
    bus: Bus,
    fuel: Fuel,
    banknote: Banknote,
    "piggy-bank": PiggyBank,
    "trending-down": TrendingDown,
    calculator: Calculator,
    "file-text": FileText,
    clipboard: Clipboard,
    folder: Folder,
    mail: Mail,
    globe: Globe,
    lock: Lock,
    key: Key,
    settings: Settings,
    "help-circle": HelpCircle,
    info: Info,
    "alert-circle": AlertCircle,
    "check-circle": CheckCircle,
    "x-circle": XCircle,
    eye: Eye,
    "eye-off": EyeOff,
    play: Play,
  };

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/analytics"],
  });

  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: categoriesDB } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Helper function to get category color from database
  const getCategoryColorFromDB = (categoryName: string): string => {
    // Special handling for Income category - always light green
    if (categoryName === "Einkommen" || categoryName === "Income") {
      return "bg-green-100 text-green-600 dark:bg-green-900/20 dark:text-green-400";
    }
    
    const category = categoriesDB?.find(cat => cat.name === categoryName);
    return category ? getColorClasses(category.color) : getCategoryColor(categoryName);
  };

  if (analyticsLoading || expensesLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="text-center">Auswertungen werden geladen...</div>
          </div>
        </div>
      </div>
    );
  }

  // Calculate category breakdown
  const categoryBreakdown = expenses?.reduce((acc, expense) => {
    const monthly = expense.frequency === "monthly" ? expense.amount :
                   expense.frequency === "quarterly" ? expense.amount / 3 :
                   expense.frequency === "yearly" ? expense.amount / 12 :
                   expense.frequency === "one-time" ? expense.amount / 12 : expense.amount;
    
    acc[expense.category] = (acc[expense.category] || 0) + monthly;
    return acc;
  }, {} as Record<string, number>) || {};

  const categoryBreakdownData = Object.entries(categoryBreakdown).map(([name, amount]) => ({
    name,
    amount,
    percentage: ((amount / (analytics?.monthlyTotal || 1)) * 100).toFixed(1)
  })).sort((a, b) => b.amount - a.amount);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Auswertungen</h2>
              <p className="text-slate-500 dark:text-slate-400">Detaillierte Ausgabenanalyse und Trends</p>
            </div>
            <div className="flex items-center gap-4">
              <select 
                className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                value={selectedPeriod}
                onChange={(e) => setSelectedPeriod(e.target.value)}
              >
                <option value="6months">Letzte 6 Monate</option>
                <option value="12months">Letzte 12 Monate</option>
                <option value="2years">Letzte 2 Jahre</option>
              </select>
              <Button className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                <Download className="h-4 w-4" />
                Bericht exportieren
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monatlicher Durchschnitt</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {formatCurrency(analytics?.monthlyTotal || 0)}
                    </p>
                  </div>
                  <Calendar className="h-8 w-8 text-blue-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    Aktueller Monatswert
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Höchste Kategorie</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {categoryBreakdownData[0]?.name || "N/A"}
                    </p>
                  </div>
                  <TrendingUp className="h-8 w-8 text-red-500" />
                </div>
                <div className="mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">
                    {formatCurrency(categoryBreakdownData[0]?.amount || 0)} ({categoryBreakdownData[0]?.percentage || 0}%)
                  </span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fix vs. Variabel</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => !e.isVariable).length || 0}:{expenses?.filter(e => e.isVariable).length || 0}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-purple-100 dark:bg-purple-900 rounded-lg flex items-center justify-center">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Verhältnis Fix zu Variabel</span>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Total Categories</p>
                    <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                      {Object.keys(categoryBreakdown).length}
                    </p>
                  </div>
                  <div className="h-8 w-8 bg-green-100 dark:bg-green-900 rounded-lg flex items-center justify-center">
                    <i className="fas fa-tags text-green-500"></i>
                  </div>
                </div>
                <div className="mt-2">
                  <span className="text-sm text-slate-600 dark:text-slate-400">Active categories</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {analytics?.monthlyTrend && (
              <MonthlyTrendChart data={analytics.monthlyTrend} />
            )}
            
            {analytics?.splitData && (
              <SplitPieChart data={analytics.splitData} />
            )}
          </div>

          {/* Category Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <Card>
              <CardHeader>
                <CardTitle>Kategorienaufschlüsselung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {categoryBreakdownData.map((category, index) => {
                    const categoryColor = getCategoryColorFromDB(category.name);
                    const categoryIcon = getCategoryIcon(category.name);
                    const IconComponent = iconMap[categoryIcon] || Home;
                    return (
                      <div key={category.name} className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${categoryColor}`}>
                            <IconComponent className="h-4 w-4" />
                          </div>
                          <span className="text-slate-700 dark:text-slate-300">{category.name}</span>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-slate-800 dark:text-slate-100">
                            {formatCurrency(category.amount)}
                          </div>
                          <div className="text-sm text-slate-500 dark:text-slate-400">
                            {category.percentage}%
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Ausgabenverteilung</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Fixkosten</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => !e.isVariable).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Variable Ausgaben</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => e.isVariable).length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Monatliche Häufigkeit</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => e.frequency === "monthly").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Jährliche Häufigkeit</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => e.frequency === "yearly").length || 0}
                    </span>
                  </div>
                  <div className="flex justify-between items-center p-4 bg-slate-50 dark:bg-slate-800 rounded-lg">
                    <span className="text-slate-700 dark:text-slate-300">Einmalige Zahlungen</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-100">
                      {expenses?.filter(e => e.frequency === "one-time").length || 0}
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </div>
  );
}