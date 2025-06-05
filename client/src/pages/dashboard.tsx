import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Sidebar } from "@/components/sidebar";
import { ExpenseModal } from "@/components/expense-modal";
import { MonthlyTrendChart } from "@/components/charts/monthly-trend-chart";
import { SplitPieChart } from "@/components/charts/split-pie-chart";
import { formatCurrency, getMonthlyEquivalent, getCategoryIcon, getCategoryColor, getExpenseIcon, translateFrequency, getColorClasses } from "@/lib/utils";
import { Download, TrendingUp, TrendingDown, Minus, Edit, Trash2, Home, Zap, Car, Utensils, Heart, Shield, Receipt, Coffee, Gift, Phone, Wifi, CreditCard, ShoppingCart, Plane, Book, Music, Gamepad, Shirt, Baby, PawPrint, Wrench, Briefcase, GraduationCap, MapPin, Calendar, Users, User, Star, Check, Bell, Clock, Lightbulb, Target, Award, Flag, Camera, Headphones, Monitor, Gamepad2, Palette, Scissors, Hammer, Truck, Bike, Train, Bus, Fuel, Banknote, PiggyBank, Calculator, FileText, Clipboard, Folder, Mail, Globe, Lock, Key, Settings, HelpCircle, Info, AlertCircle, CheckCircle, XCircle, Eye, EyeOff, Play, ChevronDown } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import type { Expense, Category } from "@shared/schema";

interface AnalyticsData {
  monthlyTotal: number;
  user1Share: number;
  user2Share: number;
  user1Name: string;
  user2Name: string;
  user1ProfileImage?: string;
  user2ProfileImage?: string;
  activeExpenses: number;
  monthlyTrend: Array<{ month: string; amount: number }>;
  splitData: Array<{ name: string; value: number; amount: number }>;
  fixedCostsTotal: number;
  fixedCostsTrend: number;
}

export default function Dashboard() {
  const [activeTab, setActiveTab] = useState("dashboard");
  const [editingExpense, setEditingExpense] = useState<Expense | null>(null);
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());

  // Generate available years
  const currentYear = new Date().getFullYear();
  const availableYears = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3].filter(year => year >= 2022);
  const { toast } = useToast();
  const queryClient = useQueryClient();

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

  const { data: expenses, isLoading: expensesLoading } = useQuery<Expense[]>({
    queryKey: ["/api/expenses"],
  });

  const { data: analytics, isLoading: analyticsLoading } = useQuery<AnalyticsData>({
    queryKey: [`/api/analytics?year=${selectedYear}`],
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

  const deleteMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/expenses/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Success", description: "Expense deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete expense", variant: "destructive" });
    },
  });

  const handleDeleteExpense = (id: number) => {
    if (confirm("Are you sure you want to delete this expense?")) {
      deleteMutation.mutate(id);
    }
  };

  // Export functions
  const exportToCSV = () => {
    if (!expenses || !analytics) return;

    const csvData = expenses.map(expense => ({
      Name: expense.name,
      Amount: expense.amount,
      Frequency: translateFrequency(expense.frequency),
      Category: expense.category,
      'Monthly Equivalent': getMonthlyEquivalent(expense.amount, expense.frequency).toFixed(2),
      'Is Variable': expense.isVariable ? 'Ja' : 'Nein',
      'Is Income': expense.isIncome ? 'Ja' : 'Nein',
      'Created At': new Date(expense.createdAt).toLocaleDateString('de-DE'),
      'Updated At': new Date(expense.updatedAt).toLocaleDateString('de-DE'),
      Icon: expense.icon || '',
      'Variable Month': expense.variableMonth || '',
      'Variable Year': expense.variableYear || ''
    }));

    const csvString = [
      Object.keys(csvData[0]).join(','),
      ...csvData.map(row => Object.values(row).map(val => `"${val}"`).join(','))
    ].join('\n');

    const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${selectedYear}_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const exportToPDF = async () => {
    if (!expenses || !analytics) return;

    try {
      // Import jsPDF
      const jsPDFModule = await import('jspdf');
      const jsPDF = jsPDFModule.default || jsPDFModule.jsPDF;
      
      const doc = new jsPDF();
      
      // Add title
      doc.setFontSize(20);
      doc.text('Haushaltsausgaben Übersicht', 20, 20);
      
      // Add date and year
      doc.setFontSize(12);
      doc.text(`Berichtszeitraum: ${selectedYear}`, 20, 30);
      doc.text(`Erstellt am: ${new Date().toLocaleDateString('de-DE')}`, 20, 40);

      // Add summary info
      doc.setFontSize(14);
      doc.text('Zusammenfassung', 20, 55);
      doc.setFontSize(10);
      doc.text(`Monatlich gesamt: ${formatCurrency(analytics.monthlyTotal)}`, 20, 65);
      doc.text(`${analytics.user1Name}: ${formatCurrency(analytics.user1Share)}`, 20, 75);
      doc.text(`${analytics.user2Name}: ${formatCurrency(analytics.user2Share)}`, 20, 85);
      doc.text(`Aktive Ausgaben: ${analytics.activeExpenses}`, 20, 95);

      // Add expenses list manually (without autoTable)
      doc.setFontSize(14);
      doc.text('Ausgaben Details:', 20, 110);
      
      let currentY = 125;
      doc.setFontSize(10);
      
      // Table headers
      doc.setFont('helvetica', 'bold');
      doc.text('Icon', 20, currentY);
      doc.text('Name', 35, currentY);
      doc.text('Betrag', 90, currentY);
      doc.text('Häufigkeit', 130, currentY);
      doc.text('Kategorie', 170, currentY);
      
      currentY += 10;
      doc.setFont('helvetica', 'normal');
      
      // Add expenses
      expenses.forEach((expense, index) => {
        if (currentY > 270) {
          // Add new page if needed
          doc.addPage();
          currentY = 20;
        }
        
        // Alternate row background (simulated with gray text)
        if (index % 2 === 0) {
          doc.setTextColor(60, 60, 60);
        } else {
          doc.setTextColor(30, 30, 30);
        }
        
        // Add category icon indicator with different shapes and colors
        const category = categoriesDB?.find(cat => cat.name === expense.category);
        const iconColors = [
          [52, 152, 219],   // Blue
          [46, 204, 113],   // Green  
          [155, 89, 182],   // Purple
          [241, 196, 15],   // Yellow
          [231, 76, 60],    // Red
          [230, 126, 34],   // Orange
          [149, 165, 166],  // Gray
          [26, 188, 156]    // Teal
        ];
        
        const categorySet = new Set<string>();
        expenses.forEach(e => categorySet.add(e.category));
        const categoryIndex = Array.from(categorySet).indexOf(expense.category);
        const color = iconColors[categoryIndex % iconColors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        
        // Draw different shapes for different categories
        const shapeType = categoryIndex % 4;
        switch (shapeType) {
          case 0: // Circle
            doc.circle(25, currentY - 2, 2, 'F');
            break;
          case 1: // Square
            doc.rect(23, currentY - 4, 4, 4, 'F');
            break;
          case 2: // Triangle (simplified as small rectangle)
            doc.rect(23, currentY - 3, 4, 2, 'F');
            break;
          case 3: // Diamond (simplified as rotated square)
            doc.rect(24, currentY - 3, 2, 2, 'F');
            break;
        }
        
        // Truncate long names
        const name = expense.name.length > 12 ? expense.name.substring(0, 12) + '...' : expense.name;
        const categoryName = expense.category.length > 10 ? expense.category.substring(0, 10) + '...' : expense.category;
        
        doc.text(name, 35, currentY);
        doc.text(formatCurrency(expense.amount), 90, currentY);
        doc.text(translateFrequency(expense.frequency), 130, currentY);
        doc.text(categoryName, 170, currentY);
        
        currentY += 8;
      });

      // Reset text color
      doc.setTextColor(0, 0, 0);
      
      // Add pie chart visualization
      currentY += 20;
      if (currentY > 240) {
        doc.addPage();
        currentY = 20;
      }
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'bold');
      doc.text('Ausgaben nach Kategorien (Balkendiagramm):', 20, currentY);
      
      currentY += 15;
      
      // Calculate category totals
      const categoryTotals = new Map<string, number>();
      expenses.forEach(expense => {
        const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
        const current = categoryTotals.get(expense.category) || 0;
        categoryTotals.set(expense.category, current + monthlyAmount);
      });
      
      // Draw horizontal bar chart
      const chartX = 20;
      let chartY = currentY;
      const barWidth = 80;
      const barHeight = 8;
      
      const colors = [
        [52, 152, 219],   // Blue
        [46, 204, 113],   // Green  
        [155, 89, 182],   // Purple
        [241, 196, 15],   // Yellow
        [231, 76, 60],    // Red
        [230, 126, 34],   // Orange
        [149, 165, 166],  // Gray
        [26, 188, 156]    // Teal
      ];
      
      let colorIndex = 0;
      const total = Array.from(categoryTotals.values()).reduce((sum, val) => sum + val, 0);
      
      // Draw horizontal bars with labels
      Array.from(categoryTotals.entries()).forEach(([category, amount]) => {
        const percentage = (amount / total) * 100;
        const currentBarWidth = (percentage / 100) * barWidth;
        
        // Set color for this bar
        const color = colors[colorIndex % colors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        
        // Draw colored bar
        doc.rect(chartX, chartY, currentBarWidth, barHeight, 'F');
        
        // Draw outline
        doc.setDrawColor(200, 200, 200);
        doc.rect(chartX, chartY, barWidth, barHeight, 'S');
        
        // Add category name and percentage
        doc.setTextColor(0, 0, 0);
        doc.setFontSize(8);
        doc.text(`${category} (${percentage.toFixed(1)}%)`, chartX + barWidth + 5, chartY + 5);
        
        chartY += barHeight + 3;
        colorIndex++;
      });
      
      // Add detailed legend below chart
      currentY = chartY + 10;
      doc.setFontSize(10);
      doc.setFont('helvetica', 'bold');
      doc.text('Detaillierte Aufschlüsselung:', 20, currentY);
      
      currentY += 10;
      doc.setFontSize(9);
      doc.setFont('helvetica', 'normal');
      
      colorIndex = 0;
      Array.from(categoryTotals.entries()).forEach(([category, amount]) => {
        if (currentY > 270) return;
        
        const color = colors[colorIndex % colors.length];
        doc.setFillColor(color[0], color[1], color[2]);
        doc.rect(20, currentY - 3, 4, 4, 'F');
        
        const percentage = ((amount / total) * 100).toFixed(1);
        doc.setTextColor(0, 0, 0);
        doc.text(`${category}: ${formatCurrency(amount)} (${percentage}%)`, 30, currentY);
        
        currentY += 8;
        colorIndex++;
      });

      // Save PDF
      const filename = `expenses_${selectedYear}_${new Date().toISOString().split('T')[0]}.pdf`;
      doc.save(filename);
      
      toast({ title: "Erfolg", description: "PDF wurde erfolgreich erstellt" });
    } catch (error) {
      console.error('PDF Export Error:', error);
      toast({ 
        title: "Fehler", 
        description: "PDF konnte nicht erstellt werden. Bitte versuchen Sie es erneut.", 
        variant: "destructive" 
      });
    }
  };

  const currentDate = new Date().toLocaleDateString("en-US", { 
    month: "long", 
    year: "numeric" 
  });

  if (expensesLoading || analyticsLoading) {
    return (
      <div className="min-h-screen flex">
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
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
        <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
        
        <div className="flex-1 ml-64">
          {/* Header */}
          <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-8 py-6">
            <div className="flex justify-between items-center">
              <div>
                <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Übersicht</h2>
                <p className="text-slate-500 dark:text-slate-400">{currentDate}</p>
              </div>
              <div className="flex items-center gap-4">
                <select 
                  className="border border-slate-300 dark:border-slate-600 rounded-lg px-3 py-2 text-sm bg-white dark:bg-slate-700 text-slate-900 dark:text-slate-100"
                  value={selectedYear}
                  onChange={(e) => setSelectedYear(e.target.value)}
                >
                  <option value="2025">2025</option>
                  <option value="2024">2024</option>
                  <option value="2023">2023</option>
                  <option value="2022">2022</option>
                </select>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="bg-green-600 hover:bg-green-700 text-white transition-colors flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Exportieren
                      <ChevronDown className="h-4 w-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onClick={exportToCSV} className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Als CSV exportieren
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={exportToPDF} className="flex items-center gap-2">
                      <Download className="h-4 w-4" />
                      Als PDF exportieren
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          </header>

          {/* Dashboard Content */}
          <main className="p-8">
            {/* Expense Type Tabs */}
            <Tabs defaultValue="all" className="mb-8">
              <TabsList className="grid w-full grid-cols-3 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg">
                <TabsTrigger value="all" className="flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Alle Ausgaben
                </TabsTrigger>
                <TabsTrigger value="fixed" className="flex items-center gap-2">
                  <Home className="h-4 w-4" />
                  Fixkosten
                </TabsTrigger>
                <TabsTrigger value="variable" className="flex items-center gap-2">
                  <Zap className="h-4 w-4" />
                  Variable Kosten
                </TabsTrigger>
              </TabsList>

              <TabsContent value="all">
                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Monatlich gesamt</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(analytics?.monthlyTotal || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                      <Calculator className="h-6 w-6 text-primary" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      Basierend auf {analytics?.activeExpenses || 0} aktiven Ausgaben
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{analytics?.user1Name || "User 1"} Anteil</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(analytics?.user1Share || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-accent/10 rounded-lg flex items-center justify-center overflow-hidden">
                      {analytics?.user1ProfileImage ? (
                        <img 
                          src={analytics.user1ProfileImage} 
                          alt={analytics.user1Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <User className="h-6 w-6 text-accent" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {Math.round((analytics?.user1Share || 0) / (analytics?.monthlyTotal || 1) * 100)}% der Gesamtausgaben
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">{analytics?.user2Name || "User 2"} Anteil</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(analytics?.user2Share || 0)}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-secondary/10 rounded-lg flex items-center justify-center overflow-hidden">
                      {analytics?.user2ProfileImage ? (
                        <img 
                          src={analytics.user2ProfileImage} 
                          alt={analytics.user2Name}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <Users className="h-6 w-6 text-secondary" />
                      )}
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {Math.round((analytics?.user2Share || 0) / (analytics?.monthlyTotal || 1) * 100)}% der Gesamtausgaben
                    </span>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="p-6">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Aktive Ausgaben</p>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {analytics?.activeExpenses || 0}
                      </p>
                    </div>
                    <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                      <Receipt className="h-6 w-6 text-red-500" />
                    </div>
                  </div>
                  <div className="mt-4">
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {expenses?.filter(expense => {
                        const expenseDate = new Date(expense.createdAt || '');
                        const currentMonth = new Date().getMonth();
                        const currentYear = new Date().getFullYear();
                        return expenseDate.getMonth() === currentMonth && expenseDate.getFullYear() === currentYear;
                      }).length || 0} diesen Monat hinzugefügt
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Fixed Costs Trend */}
            {analytics && (
              <Card className="mb-8 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <CardHeader>
                  <CardTitle className="text-slate-800 dark:text-slate-200">Fixkosten Trend</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                        {formatCurrency(analytics.fixedCostsTotal)}
                      </p>
                      <p className="text-sm text-slate-600 dark:text-slate-400">Monatliche Fixkosten</p>
                    </div>
                    <div className="text-right">
                      <div className={`flex items-center gap-1 ${
                        analytics.fixedCostsTrend > 0 
                          ? 'text-red-500 dark:text-red-400' 
                          : analytics.fixedCostsTrend < 0 
                            ? 'text-green-500 dark:text-green-400' 
                            : 'text-slate-500 dark:text-slate-400'
                      }`}>
                        {analytics.fixedCostsTrend > 0 ? (
                          <TrendingUp className="w-4 h-4" />
                        ) : analytics.fixedCostsTrend < 0 ? (
                          <TrendingDown className="w-4 h-4" />
                        ) : (
                          <span className="w-4 h-4 flex items-center justify-center text-xs">—</span>
                        )}
                        <span className="font-medium">
                          {Math.abs(analytics.fixedCostsTrend).toFixed(1)}%
                        </span>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400">vs. Vorjahr</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
              {analytics?.monthlyTrend && (
                <MonthlyTrendChart data={analytics.monthlyTrend} />
              )}
              
              {analytics?.splitData && (
                <SplitPieChart data={analytics.splitData} />
              )}
            </div>

            {/* Expenses List and Year Comparison */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Expenses */}
              <Card className="lg:col-span-2 bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Aktuelle Ausgaben</h3>
                    <Button variant="ghost" size="sm" className="text-primary hover:text-blue-600 dark:text-blue-400 dark:hover:text-blue-300">
                      Alle anzeigen
                    </Button>
                  </div>
                </div>
                <CardContent className="p-6">
                  <div className="space-y-4">
                    {expenses?.map((expense) => {
                      const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
                      const categoryColor = getCategoryColorFromDB(expense.category);
                      const expenseIcon = getExpenseIcon(expense);
                      const IconComponent = iconMap[expenseIcon] || Home;
                      
                      return (
                        <div 
                          key={expense.id}
                          className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                        >
                          <div className="flex items-center gap-4 min-w-0 flex-1">
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
                            <div className="min-w-0 flex-1">
                              <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{expense.name}</p>
                              <p className="text-sm text-slate-500 dark:text-slate-400">
                                {translateFrequency(expense.frequency)} • {expense.isVariable ? "Variabel" : "Fix"}
                              </p>
                            </div>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="text-right">
                              <p className={`font-semibold ${expense.isIncome ? 'text-green-600 dark:text-green-400' : 'text-slate-800 dark:text-slate-200'}`}>
                                {expense.isIncome ? '+' : ''}{formatCurrency(monthlyAmount)}
                              </p>
                              {expense.frequency !== "monthly" && (
                                <p className="text-xs text-slate-500 dark:text-slate-400">Monatlich</p>
                              )}
                            </div>
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>


            </div>
              </TabsContent>

              <TabsContent value="fixed">
                {/* Fixed Costs Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Fixkosten gesamt</p>
                          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(expenses?.filter(e => !e.isVariable).reduce((total, expense) => {
                              return total + getMonthlyEquivalent(expense.amount, expense.frequency);
                            }, 0) || 0)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/20 rounded-lg flex items-center justify-center">
                          <Home className="h-6 w-6 text-blue-600 dark:text-blue-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Fixed Expenses List */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Fixkosten</h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {expenses?.filter(expense => !expense.isVariable).map((expense) => {
                        const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
                        const categoryColor = getCategoryColor(expense.category);
                        const expenseIcon = getExpenseIcon(expense);
                        
                        return (
                          <div 
                            key={expense.id}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor}`}>
                                <i className={`fas fa-${expenseIcon}`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{expense.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {expense.frequency} • Fixed Cost
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {formatCurrency(monthlyAmount)}
                                </p>
                                {expense.frequency !== "monthly" && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Monatlich</p>
                                )}
                              </div>
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
                            </div>
                          </div>
                        );
                      })}
                      {expenses?.filter(expense => !expense.isVariable).length === 0 && (
                        <div className="text-center py-12">
                          <Home className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Keine Fixkosten</h3>
                          <p className="text-slate-600 dark:text-slate-400">Fügen Sie Fixkosten hinzu, um sie hier zu sehen</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="variable">
                {/* Variable Costs Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                  <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-slate-500 dark:text-slate-400 text-sm font-medium">Variable Kosten gesamt</p>
                          <p className="text-2xl font-bold text-slate-800 dark:text-slate-200">
                            {formatCurrency(expenses?.filter(e => e.isVariable).reduce((total, expense) => {
                              return total + getMonthlyEquivalent(expense.amount, expense.frequency);
                            }, 0) || 0)}
                          </p>
                        </div>
                        <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/20 rounded-lg flex items-center justify-center">
                          <Zap className="h-6 w-6 text-orange-600 dark:text-orange-400" />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Variable Expenses List */}
                <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
                  <div className="p-6 border-b border-slate-200 dark:border-slate-700">
                    <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-200">Variable Kosten</h3>
                  </div>
                  <CardContent className="p-6">
                    <div className="space-y-4">
                      {expenses?.filter(expense => expense.isVariable).map((expense) => {
                        const monthlyAmount = getMonthlyEquivalent(expense.amount, expense.frequency);
                        const categoryColor = getCategoryColor(expense.category);
                        const expenseIcon = getExpenseIcon(expense);
                        
                        return (
                          <div 
                            key={expense.id}
                            className="flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-lg transition-colors group"
                          >
                            <div className="flex items-center gap-4 min-w-0 flex-1">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${categoryColor}`}>
                                <i className={`fas fa-${expenseIcon}`}></i>
                              </div>
                              <div className="min-w-0 flex-1">
                                <p className="font-medium text-slate-800 dark:text-slate-200 truncate">{expense.name}</p>
                                <p className="text-sm text-slate-500 dark:text-slate-400">
                                  {expense.frequency} • Variable Cost
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-3">
                              <div className="text-right">
                                <p className="font-semibold text-slate-800 dark:text-slate-200">
                                  {formatCurrency(monthlyAmount)}
                                </p>
                                {expense.frequency !== "monthly" && (
                                  <p className="text-xs text-slate-500 dark:text-slate-400">Monatlich</p>
                                )}
                              </div>
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
                            </div>
                          </div>
                        );
                      })}
                      {expenses?.filter(expense => expense.isVariable).length === 0 && (
                        <div className="text-center py-12">
                          <Zap className="h-12 w-12 mx-auto text-slate-400 dark:text-slate-500 mb-4" />
                          <h3 className="text-lg font-medium text-slate-800 dark:text-slate-200 mb-2">Keine variablen Kosten</h3>
                          <p className="text-slate-600 dark:text-slate-400">Fügen Sie variable Ausgaben hinzu, um sie hier zu sehen</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </main>
        </div>
        
        {editingExpense && (
          <ExpenseModal
            isOpen={!!editingExpense}
            onClose={() => setEditingExpense(null)}
            expense={editingExpense}
          />
        )}
    </div>
  );
}
