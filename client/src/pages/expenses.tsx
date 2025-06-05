import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Sidebar } from "@/components/sidebar";
import { ExpenseModal } from "@/components/expense-modal";
import { formatCurrency, getMonthlyEquivalent, getCategoryIcon, getCategoryColor, getExpenseIcon, translateFrequency, getColorClasses } from "@/lib/utils";
import { Edit, Trash2, Search, Filter, Plus, Home, Car, Utensils, Heart, Zap, Shield, Receipt, Coffee, TrendingUp, Gift, Phone, Wifi, CreditCard, ShoppingCart, Plane, Book, Music, Gamepad, Shirt, Baby, PawPrint, Wrench, Briefcase, GraduationCap, MapPin, Calendar, Users, Star, Check, Bell, Clock, Lightbulb, Target, Award, Flag, Camera, Headphones, Monitor, Gamepad2, Palette, Scissors, Hammer, Truck, Bike, Train, Bus, Fuel, Banknote, PiggyBank, TrendingDown, Calculator, FileText, Clipboard, Folder, Mail, Globe, Lock, Key, Settings, HelpCircle, Info, AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Grid3X3, List } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Expense, Category } from "@shared/schema";

export default function ExpensesPage() {
  const [activeTab, setActiveTab] = useState("expenses");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Generate available years (current year and previous years with data)
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3].filter(year => year >= 2022);

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
  };

  const { data: expenses, isLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
    enabled: selectedYear === currentYear, // Only load current expenses for current year
  });

  const { data: historicalExpenses, isLoading: isLoadingHistorical } = useQuery<any[]>({
    queryKey: [`/api/historical-expenses/${selectedYear}`],
    enabled: selectedYear !== currentYear, // Only load historical data for previous years
  });

  const { data: categoryData } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Transform historical data to expense-like format for display
  const displayData = selectedYear === currentYear 
    ? expenses 
    : historicalExpenses?.map((historical: any) => ({
        id: historical.id,
        name: historical.expenseName,
        amount: historical.amount,
        frequency: historical.frequency,
        category: historical.category,
        isVariable: false,
        isIncome: false,
        icon: "receipt",
        imageUrl: null,
        variableMonth: null,
        variableYear: null,
        createdAt: historical.createdAt,
        updatedAt: historical.createdAt,
      }));

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Erfolgreich", description: "Ausgabe erfolgreich gelöscht" });
    },
    onError: () => {
      toast({ title: "Fehler", description: "Löschen der Ausgabe fehlgeschlagen", variant: "destructive" });
    },
  });

  const handleDeleteExpense = (id: number) => {
    if (confirm("Sind Sie sicher, dass Sie diese Ausgabe löschen möchten?")) {
      deleteMutation.mutate(id);
    }
  };

  const filteredExpenses = displayData?.filter(expense => {
    const matchesSearch = expense.name.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = filterCategory === "all" || expense.category === filterCategory;
    return matchesSearch && matchesCategory;
  }) || [];

  const isHistoricalView = selectedYear !== currentYear;
  const currentLoading = selectedYear === currentYear ? isLoading : isLoadingHistorical;

  // Helper function to get category color from database
  const getCategoryColorFromDB = (categoryName: string): string => {
    const category = categoryData?.find(cat => cat.name === categoryName);
    return category ? getColorClasses(category.color) : getCategoryColor(categoryName);
  };

  const filterCategories = ["all", ...(categoryData?.map(cat => cat.name) || [])];

  if (currentLoading) {
    return (
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        <div className="flex-1 ml-64">
          <div className="p-8">
            <div className="text-center">Lädt...</div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div className="flex items-center gap-6">
                <div>
                  <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">
                    {isHistoricalView ? `Ausgaben ${selectedYear}` : 'Alle Ausgaben'}
                  </h2>
                  <p className="text-slate-500 dark:text-slate-400">
                    {isHistoricalView ? 'Historische Ausgabendaten' : 'Verwalten Sie Ihre Haushaltsausgaben'}
                  </p>
                </div>
                
                {/* Year Selector */}
                <div className="flex items-center gap-2">
                  <Calendar className="h-4 w-4 text-slate-500" />
                  <select
                    value={selectedYear}
                    onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                    className="px-3 py-1 border border-slate-300 dark:border-slate-600 rounded-md bg-white dark:bg-slate-700 text-slate-700 dark:text-slate-300 text-sm"
                  >
                    {availableYears.map(year => (
                      <option key={year} value={year}>
                        {year}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {!isHistoricalView && (
                <Button 
                  onClick={() => setIsAddModalOpen(true)}
                  className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  Ausgabe hinzufügen
                </Button>
              )}
            </div>
          </header>

          {/* Content */}
          <main className="p-8">
            {/* Filters */}
            <Card className="mb-6">
              <CardContent className="p-6">
                <div className="flex flex-col md:flex-row gap-4">
                  <div className="flex-1">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-slate-400" />
                      <Input
                        placeholder="Ausgaben durchsuchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Filter className="h-4 w-4 text-slate-400" />
                      <select
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                        className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-800 dark:text-slate-100"
                      >
                        {filterCategories.map(category => (
                          <option key={category} value={category}>
                            {category === "all" ? "Alle Kategorien" : category}
                          </option>
                        ))}
                      </select>
                    </div>
                    
                    {/* View Toggle */}
                    <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-lg">
                      <Button
                        variant={viewMode === "grid" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("grid")}
                        className="rounded-r-none"
                      >
                        <Grid3X3 className="h-4 w-4" />
                      </Button>
                      <Button
                        variant={viewMode === "list" ? "default" : "ghost"}
                        size="sm"
                        onClick={() => setViewMode("list")}
                        className="rounded-l-none"
                      >
                        <List className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Expenses Display */}
            {viewMode === "grid" ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {filteredExpenses.map((expense) => {
                const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
                const categoryColor = getCategoryColorFromDB(expense.category);
                const expenseIcon = getExpenseIcon(expense);
                const IconComponent = iconMap[expenseIcon] || Home;
                
                return (
                  <Card key={expense.id} className="hover:shadow-lg transition-shadow">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor}`}>
                            {expense.imageUrl ? (
                              <img 
                                src={expense.imageUrl} 
                                alt={expense.name}
                                className="w-5 h-5 object-cover rounded"
                                onError={(e) => {
                                  e.currentTarget.style.display = 'none';
                                  e.currentTarget.nextElementSibling?.removeAttribute('style');
                                }}
                              />
                            ) : null}
                            <IconComponent className={`h-5 w-5 ${expense.imageUrl ? 'hidden' : ''}`} />
                          </div>
                          <div>
                            <CardTitle className="text-lg">{expense.name}</CardTitle>
                            <p className="text-sm text-slate-500 dark:text-slate-400">{expense.category}</p>
                          </div>
                        </div>
                        {!isHistoricalView && (
                          <div className="flex gap-1 opacity-100">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => setEditingExpense(expense)}
                              className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                            >
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteExpense(expense.id)}
                              className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        )}
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Betrag</span>
                          <span className={`font-semibold ${expense.isIncome ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-100'}`}>
                            {expense.isIncome ? '+' : ''}{formatCurrency(expense.amount)}
                          </span>
                        </div>
                        {!expense.isVariable && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Häufigkeit</span>
                            <Badge variant="secondary">{translateFrequency(expense.frequency)}</Badge>
                          </div>
                        )}
                        {!expense.isVariable && expense.frequency !== "monthly" && (
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-slate-600 dark:text-slate-400">Monatlich</span>
                            <span className="text-sm font-medium text-green-600">
                              {formatCurrency(monthlyAmount)}
                            </span>
                          </div>
                        )}
                        <div className="flex justify-between items-center">
                          <span className="text-sm text-slate-600 dark:text-slate-400">Typ</span>
                          <div className="flex gap-2">
                            <Badge variant={expense.isVariable ? "outline" : "default"}>
                              {expense.isVariable ? "Variabel" : "Fix"}
                            </Badge>
                            {expense.isIncome && (
                              <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                Einkommen
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                );
              })}
              </div>
            ) : (
              // List View
              <div className="space-y-4">
                {filteredExpenses.map((expense) => {
                  const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
                  const categoryColor = getCategoryColorFromDB(expense.category);
                  const expenseIcon = getExpenseIcon(expense);
                  const IconComponent = iconMap[expenseIcon] || Home;
                  
                  return (
                    <Card key={expense.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 flex-1 min-w-0">
                            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor}`}>
                              {expense.imageUrl ? (
                                <img 
                                  src={expense.imageUrl} 
                                  alt={expense.name}
                                  className="w-5 h-5 object-cover rounded"
                                  onError={(e) => {
                                    e.currentTarget.style.display = 'none';
                                    e.currentTarget.nextElementSibling?.removeAttribute('style');
                                  }}
                                />
                              ) : null}
                              <IconComponent className={`h-5 w-5 ${expense.imageUrl ? 'hidden' : ''}`} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <h3 className="font-semibold text-slate-800 dark:text-slate-200 truncate">{expense.name}</h3>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {expense.category}{!expense.isVariable && ` • ${translateFrequency(expense.frequency)}`}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-4">
                            <div className="flex gap-2">
                              {expense.isIncome && (
                                <Badge variant="secondary" className="bg-green-100 text-green-700 dark:bg-green-900/20 dark:text-green-400">
                                  Einkommen
                                </Badge>
                              )}
                              <Badge variant={expense.isVariable ? "outline" : "default"}>
                                {expense.isVariable ? "Variabel" : "Fix"}
                              </Badge>
                            </div>
                            <div className="text-right">
                              <p className="font-semibold text-slate-800 dark:text-slate-200">{formatCurrency(expense.isVariable ? expense.amount : monthlyAmount)}</p>
                              {!expense.isVariable && (
                                <p className="text-sm text-slate-500 dark:text-slate-400">pro Monat</p>
                              )}
                            </div>
                            <div className="flex gap-1">
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => setEditingExpense(expense)}
                                className="text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={() => handleDeleteExpense(expense.id)}
                                className="text-slate-600 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-400"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            )}

            {filteredExpenses.length === 0 && (
              <Card>
                <CardContent className="p-12 text-center">
                  <p className="text-slate-500 dark:text-slate-400">Keine Ausgaben gefunden, die Ihren Kriterien entsprechen.</p>
                </CardContent>
              </Card>
            )}
          </main>
        </div>
      </div>

      <ExpenseModal 
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
      />

      {editingExpense && (
        <ExpenseModal
          isOpen={!!editingExpense}
          onClose={() => setEditingExpense(null)}
          expense={editingExpense}
        />
      )}
    </>
  );
}