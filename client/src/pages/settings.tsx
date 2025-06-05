import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/sidebar";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSplitSettingsSchema, insertCategorySchema, type InsertSplitSettings, type SplitSettings, type Category, type InsertCategory } from "@shared/schema";
import { Save, Moon, Sun, User, Percent, Settings as SettingsIcon, Plus, Edit, Trash2, Tag, Package, Receipt, Home, Zap, Car, Utensils, Shield, Play, ShoppingCart, Coffee, Plane, Heart, Book, Music, Gamepad, Gift, Phone, Wifi, CreditCard, Star, Check, X, Eye, Lock, Calendar, Clock, Mail, Camera, Image, Video, Download, Upload, Search, Filter, Trash, Archive, Folder, File, Bell, AlertCircle, Info, HelpCircle, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Loader, RefreshCw, Power, Volume2, VolumeX, Maximize, Minimize, MoreHorizontal, MoreVertical } from "lucide-react";
import { CategoryEditModal } from "@/components/category-edit-modal";

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("settings");
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [availableIcons, setAvailableIcons] = useState([
    { value: "receipt", label: "Receipt", icon: Receipt },
    { value: "home", label: "Home", icon: Home },
    { value: "bolt", label: "Lightning", icon: Zap },
    { value: "car", label: "Car", icon: Car },
    { value: "utensils", label: "Utensils", icon: Utensils },
    { value: "shield", label: "Shield", icon: Shield },
    { value: "play", label: "Play", icon: Play },
    { value: "shopping-cart", label: "Shopping", icon: ShoppingCart },
    { value: "coffee", label: "Coffee", icon: Coffee },
    { value: "plane", label: "Travel", icon: Plane },
    { value: "heart", label: "Health", icon: Heart },
    { value: "book", label: "Education", icon: Book },
    { value: "music", label: "Music", icon: Music },
    { value: "gamepad", label: "Gaming", icon: Gamepad },
    { value: "gift", label: "Gift", icon: Gift },
    { value: "phone", label: "Phone", icon: Phone },
    { value: "wifi", label: "Internet", icon: Wifi },
    { value: "credit-card", label: "Payment", icon: CreditCard },
  ]);
  const [newIconValue, setNewIconValue] = useState("");
  const [newIconLabel, setNewIconLabel] = useState("");
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: splitSettings } = useQuery<SplitSettings>({
    queryKey: ["/api/split-settings"],
  });

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<InsertSplitSettings>({
    resolver: zodResolver(insertSplitSettingsSchema),
    defaultValues: {
      user1Name: "You",
      user1Percentage: 50,
      user2Name: "Partner",
      user2Percentage: 50,
    },
  });

  // Update form when splitSettings loads
  useEffect(() => {
    if (splitSettings) {
      form.reset({
        user1Name: splitSettings.user1Name,
        user1Percentage: splitSettings.user1Percentage,
        user2Name: splitSettings.user2Name,
        user2Percentage: splitSettings.user2Percentage,
      });
    }
  }, [splitSettings, form]);

  const updateMutation = useMutation({
    mutationFn: async (data: InsertSplitSettings) => {
      const response = await apiRequest("PUT", "/api/split-settings", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/split-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Success", description: "Settings updated successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update settings", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertSplitSettings) => {
    const user1Pct = data.user1Percentage || 0;
    const user2Pct = data.user2Percentage || 0;
    if (user1Pct + user2Pct !== 100) {
      toast({ 
        title: "Error", 
        description: "Percentages must add up to 100%", 
        variant: "destructive" 
      });
      return;
    }
    updateMutation.mutate(data);
  };

  const handleUser1PercentageChange = (value: number) => {
    form.setValue("user1Percentage", value);
    form.setValue("user2Percentage", 100 - value);
  };

  const handleUser2PercentageChange = (value: number) => {
    form.setValue("user2Percentage", value);
    form.setValue("user1Percentage", 100 - value);
  };

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('darkMode', (!isDarkMode).toString());
  };

  // Category mutations
  const createCategoryMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("POST", "/api/categories", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Erfolgreich", description: "Kategorie erfolgreich erstellt" });
      setNewCategoryName("");
    },
    onError: () => {
      toast({ title: "Fehler", description: "Kategorie konnte nicht erstellt werden", variant: "destructive" });
    },
  });

  const updateCategoryMutation = useMutation({
    mutationFn: async ({ id, data }: { id: number; data: Partial<InsertCategory> }) => {
      const response = await apiRequest("PUT", `/api/categories/${id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Erfolgreich", description: "Kategorie erfolgreich aktualisiert" });
      setEditingCategory(null);
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    },
  });

  const deleteCategoryMutation = useMutation({
    mutationFn: async (id: number) => {
      await apiRequest("DELETE", `/api/categories/${id}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category deleted successfully" });
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to delete category", variant: "destructive" });
    },
  });

  const handleCreateCategory = () => {
    if (!newCategoryName.trim()) return;
    createCategoryMutation.mutate({
      name: newCategoryName,
      icon: "tag",
      color: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400",
    });
  };

  const handleDeleteCategory = (id: number) => {
    if (confirm("Are you sure you want to delete this category?")) {
      deleteCategoryMutation.mutate(id);
    }
  };

  const handleAddIcon = () => {
    if (!newIconValue.trim() || !newIconLabel.trim()) {
      toast({ title: "Error", description: "Please provide both icon value and label", variant: "destructive" });
      return;
    }

    const iconExists = availableIcons.some(icon => icon.value === newIconValue);
    if (iconExists) {
      toast({ title: "Error", description: "Icon already exists", variant: "destructive" });
      return;
    }

    // Map icon names to Lucide components
    const iconMapping: Record<string, any> = {
      receipt: Receipt, home: Home, bolt: Zap, car: Car, utensils: Utensils,
      shield: Shield, play: Play, "shopping-cart": ShoppingCart, coffee: Coffee,
      plane: Plane, heart: Heart, book: Book, music: Music, gamepad: Gamepad,
      gift: Gift, phone: Phone, wifi: Wifi, "credit-card": CreditCard,
      tag: Tag, plus: Plus, edit: Edit, "trash-2": Trash2, user: User,
      settings: SettingsIcon, percent: Percent, save: Save, sun: Sun, moon: Moon,
      package: Package, star: Star, check: Check, x: X, eye: Eye, lock: Lock,
      calendar: Calendar, clock: Clock, mail: Mail, camera: Camera, image: Image,
      video: Video, download: Download, upload: Upload, search: Search, filter: Filter,
      archive: Archive, folder: Folder, file: File, bell: Bell,
      "alert-circle": AlertCircle, info: Info, "help-circle": HelpCircle,
      "chevron-up": ChevronUp, "chevron-down": ChevronDown, "chevron-left": ChevronLeft,
      "chevron-right": ChevronRight, "arrow-up": ArrowUp, "arrow-down": ArrowDown,
      "arrow-left": ArrowLeft, "arrow-right": ArrowRight, loader: Loader,
      "refresh-cw": RefreshCw, power: Power, "volume-2": Volume2, "volume-x": VolumeX,
      maximize: Maximize, minimize: Minimize, "more-horizontal": MoreHorizontal,
      "more-vertical": MoreVertical
    };

    const IconComponent = iconMapping[newIconValue] || Receipt;

    setAvailableIcons(prev => [...prev, {
      value: newIconValue,
      label: newIconLabel,
      icon: IconComponent
    }]);
    
    setNewIconValue("");
    setNewIconLabel("");
    toast({ title: "Success", description: "Icon added successfully" });
  };

  const handleDeleteIcon = (iconValue: string) => {
    setAvailableIcons(prev => prev.filter(icon => icon.value !== iconValue));
    toast({ title: "Erfolgreich", description: "Symbol erfolgreich entfernt" });
  };

  // Database management handlers
  const handleExportDatabase = async () => {
    try {
      const response = await fetch('/api/database/export');
      if (!response.ok) throw new Error('Export failed');
      
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `expense-tracker-backup-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
      
      toast({ title: "Erfolg", description: "Datenbank erfolgreich exportiert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Export fehlgeschlagen", variant: "destructive" });
    }
  };

  const handleImportDatabase = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      const data = JSON.parse(text);
      
      const response = await fetch('/api/database/import', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data)
      });
      
      if (!response.ok) throw new Error('Import failed');
      
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/split-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      
      toast({ title: "Erfolg", description: "Datenbank erfolgreich importiert" });
    } catch (error) {
      toast({ title: "Fehler", description: "Import fehlgeschlagen", variant: "destructive" });
    }
    
    // Reset file input
    event.target.value = '';
  };

  const handleDeleteDatabase = async () => {
    if (!window.confirm('Sind Sie sicher, dass Sie alle Daten löschen möchten? Diese Aktion kann nicht rückgängig gemacht werden.')) {
      return;
    }

    try {
      const response = await fetch('/api/database/clear', { method: 'DELETE' });
      if (!response.ok) throw new Error('Delete failed');
      
      // Refresh all data
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      queryClient.invalidateQueries({ queryKey: ["/api/split-settings"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      
      toast({ title: "Erfolg", description: "Datenbank erfolgreich gelöscht" });
    } catch (error) {
      toast({ title: "Fehler", description: "Löschen fehlgeschlagen", variant: "destructive" });
    }
  };

  // Load dark mode preference on mount
  useEffect(() => {
    const savedDarkMode = localStorage.getItem('darkMode') === 'true';
    setIsDarkMode(savedDarkMode);
    if (savedDarkMode) {
      document.documentElement.classList.add('dark');
    }
  }, []);

  return (
    <div className="min-h-screen flex bg-slate-50 dark:bg-slate-900">
      <Sidebar activeTab={activeTab} onTabChange={setActiveTab} />
      
      <div className="flex-1 ml-64">
        {/* Header */}
        <header className="bg-white dark:bg-slate-800 shadow-sm border-b border-slate-200 dark:border-slate-700 px-8 py-6">
          <div className="flex justify-between items-center">
            <div>
              <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Settings</h2>
              <p className="text-slate-500 dark:text-slate-400">Manage your application preferences</p>
            </div>
            <SettingsIcon className="h-8 w-8 text-slate-400" />
          </div>
        </header>

        {/* Content */}
        <main className="p-8">
          <div className="max-w-4xl mx-auto space-y-8">
            
            {/* Appearance Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  {isDarkMode ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5" />}
                  Appearance
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <Label className="text-base font-medium">Dark Mode</Label>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Switch between light and dark themes
                    </p>
                  </div>
                  <Switch
                    checked={isDarkMode}
                    onCheckedChange={toggleDarkMode}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Split Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Percent className="h-5 w-5" />
                  Ausgabenaufteilung Konfiguration
                </CardTitle>
              </CardHeader>
              <CardContent>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {/* User 1 Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Erste Person
                        </h3>
                        <FormField
                          control={form.control}
                          name="user1Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Ihr Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="user1Percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aufteilungsprozentsatz</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  placeholder="50" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    handleUser1PercentageChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* User 1 Profile Image */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Profilbild</Label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                              {form.watch("user1ProfileImage") || "" ? (
                                <img 
                                  src={form.watch("user1ProfileImage") || ""} 
                                  alt="User 1 Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                type="url"
                                placeholder="Bild-URL eingeben..."
                                value={form.watch("user1ProfileImage") || ""}
                                onChange={(e) => form.setValue("user1ProfileImage", e.target.value)}
                                className="mb-2"
                              />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Geben Sie eine URL zu einem Bild ein oder lassen Sie es leer für das Standard-Symbol
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* User 2 Settings */}
                      <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-slate-800 dark:text-slate-100 flex items-center gap-2">
                          <User className="h-4 w-4" />
                          Zweite Person
                        </h3>
                        <FormField
                          control={form.control}
                          name="user2Name"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Name</FormLabel>
                              <FormControl>
                                <Input placeholder="Partner-Name" {...field} />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        <FormField
                          control={form.control}
                          name="user2Percentage"
                          render={({ field }) => (
                            <FormItem>
                              <FormLabel>Aufteilungsprozentsatz</FormLabel>
                              <FormControl>
                                <Input 
                                  type="number" 
                                  min="0"
                                  max="100"
                                  placeholder="50" 
                                  {...field}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value) || 0;
                                    handleUser2PercentageChange(value);
                                  }}
                                />
                              </FormControl>
                              <FormMessage />
                            </FormItem>
                          )}
                        />
                        
                        {/* User 2 Profile Image */}
                        <div className="space-y-2">
                          <Label className="text-sm font-medium">Profilbild</Label>
                          <div className="flex items-center gap-4">
                            <div className="w-16 h-16 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center overflow-hidden">
                              {form.watch("user2ProfileImage") || "" ? (
                                <img 
                                  src={form.watch("user2ProfileImage") || ""} 
                                  alt="User 2 Profile"
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <User className="h-8 w-8 text-slate-400" />
                              )}
                            </div>
                            <div className="flex-1">
                              <Input
                                type="url"
                                placeholder="Bild-URL eingeben..."
                                value={form.watch("user2ProfileImage") || ""}
                                onChange={(e) => form.setValue("user2ProfileImage", e.target.value)}
                                className="mb-2"
                              />
                              <p className="text-xs text-slate-500 dark:text-slate-400">
                                Geben Sie eine URL zu einem Bild ein oder lassen Sie es leer für das Standard-Symbol
                              </p>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-50 dark:bg-slate-800 p-4 rounded-lg">
                      <div className="flex justify-between items-center">
                        <span className="font-medium text-slate-700 dark:text-slate-300">Total Percentage</span>
                        <span className={`font-bold text-lg ${
                          (form.watch("user1Percentage") || 0) + (form.watch("user2Percentage") || 0) === 100 
                            ? "text-green-600" 
                            : "text-red-600"
                        }`}>
                          {(form.watch("user1Percentage") || 0) + (form.watch("user2Percentage") || 0)}%
                        </span>
                      </div>
                      <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                        Percentages must add up to exactly 100%
                      </p>
                    </div>

                    <div className="flex justify-end">
                      <Button 
                        type="submit" 
                        className="bg-green-600 hover:bg-green-700 text-white flex items-center gap-2"
                        disabled={updateMutation.isPending}
                      >
                        <Save className="h-4 w-4" />
                        Einstellungen speichern
                      </Button>
                    </div>
                  </form>
                </Form>
              </CardContent>
            </Card>

            {/* Category Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Tag className="h-5 w-5" />
                  Kategorienverwaltung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Category */}
                <div className="flex gap-3">
                  <Input
                    placeholder="Neuer Kategoriename..."
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleCreateCategory()}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleCreateCategory}
                    disabled={!newCategoryName.trim() || createCategoryMutation.isPending}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Hinzufügen
                  </Button>
                </div>

                {/* Categories List */}
                <div className="space-y-3">
                  {categories?.filter(category => category.name !== "Einkommen").map((category) => (
                    <div
                      key={category.id}
                      className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${category.color}`}>
                          <i className={`fas fa-${category.icon}`}></i>
                        </div>
                        <span className="font-medium text-slate-800 dark:text-slate-100">
                          {category.name}
                        </span>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingCategory(category)}
                          className="text-slate-600 dark:text-slate-400 hover:text-blue-600"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteCategory(category.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Icon Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="h-5 w-5" />
                  Icon Management
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Add New Icon */}
                <div className="space-y-3">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Icon value (e.g., star, check)"
                      value={newIconValue}
                      onChange={(e) => setNewIconValue(e.target.value)}
                    />
                    <Input
                      placeholder="Icon label (e.g., Star, Check)"
                      value={newIconLabel}
                      onChange={(e) => setNewIconLabel(e.target.value)}
                    />
                  </div>
                  <Button
                    onClick={handleAddIcon}
                    disabled={!newIconValue.trim() || !newIconLabel.trim()}
                    className="bg-green-600 hover:bg-green-700 text-white"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Symbol hinzufügen
                  </Button>
                </div>

                {/* Icons List */}
                <div className="space-y-3">
                  <h4 className="text-sm font-medium text-slate-600 dark:text-slate-400">Verfügbare Symbole</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {availableIcons.map((icon) => (
                      <div
                        key={icon.value}
                        className="flex items-center justify-between p-3 border border-slate-200 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-800"
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg flex items-center justify-center bg-blue-100 text-blue-600 dark:bg-blue-900/20 dark:text-blue-400">
                            <icon.icon className="h-4 w-4" />
                          </div>
                          <div>
                            <span className="font-medium text-slate-800 dark:text-slate-100">
                              {icon.label}
                            </span>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{icon.value}</p>
                          </div>
                        </div>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteIcon(icon.value)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Database Management */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Archive className="h-5 w-5" />
                  Datenbankverwaltung
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Export Database */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Datenbank exportieren</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Laden Sie alle Ihre Daten als JSON-Datei herunter</p>
                    <Button
                      onClick={handleExportDatabase}
                      className="w-full bg-blue-600 hover:bg-blue-700 text-white flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Exportieren
                    </Button>
                  </div>

                  {/* Import Database */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Datenbank importieren</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Laden Sie eine JSON-Datei hoch, um Daten zu importieren</p>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".json"
                        onChange={handleImportDatabase}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                      />
                      <Button className="w-full bg-green-600 hover:bg-green-700 text-white flex items-center gap-2">
                        <Upload className="h-4 w-4" />
                        Importieren
                      </Button>
                    </div>
                  </div>

                  {/* Delete Database */}
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-200">Datenbank löschen</h4>
                    <p className="text-xs text-slate-500 dark:text-slate-400">Alle Ausgaben und Einstellungen dauerhaft löschen</p>
                    <Button
                      onClick={handleDeleteDatabase}
                      variant="destructive"
                      className="w-full flex items-center gap-2"
                    >
                      <Trash2 className="h-4 w-4" />
                      Alles löschen
                    </Button>
                  </div>
                </div>

                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-yellow-600 dark:text-yellow-400 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-medium text-yellow-800 dark:text-yellow-200">Wichtiger Hinweis</h4>
                      <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                        Das Löschen der Datenbank kann nicht rückgängig gemacht werden. Exportieren Sie Ihre Daten vor dem Löschen.
                      </p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Application Info */}
            <Card>
              <CardHeader>
                <CardTitle>Anwendungsinformationen</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Version</Label>
                    <p className="text-slate-800 dark:text-slate-100">1.0.0</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Währung</Label>
                    <p className="text-slate-800 dark:text-slate-100">EUR (€)</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Datumsformat</Label>
                    <p className="text-slate-800 dark:text-slate-100">DD/MM/YYYY</p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium text-slate-600 dark:text-slate-400">Sprache</Label>
                    <p className="text-slate-800 dark:text-slate-100">Deutsch</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
      
      {editingCategory && (
        <CategoryEditModal
          isOpen={!!editingCategory}
          onClose={() => setEditingCategory(null)}
          category={editingCategory}
        />
      )}
    </div>
  );
}