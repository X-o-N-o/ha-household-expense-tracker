import { useState } from "react";
import { useMutation, useQueryClient, useQuery } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertExpenseSchema, type InsertExpense, type Category } from "@shared/schema";
import { Receipt, Home, Zap, Car, Utensils, Shield, Play, ShoppingCart, Coffee, Plane, Heart, Book, Music, Gamepad, Gift, Phone, Wifi, CreditCard } from "lucide-react";

interface ExpenseModalProps {
  isOpen: boolean;
  onClose: () => void;
  expense?: any; // For editing existing expenses
}

export function ExpenseModal({ isOpen, onClose, expense }: ExpenseModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  const form = useForm<InsertExpense>({
    resolver: zodResolver(insertExpenseSchema),
    defaultValues: {
      name: expense?.name || "",
      amount: expense?.amount || 0,
      frequency: expense?.frequency || "monthly",
      category: expense?.category || "Housing",
      isVariable: expense?.isVariable || false,
      isIncome: expense?.isIncome || false,
      icon: expense?.icon ?? "default",
      imageUrl: expense?.imageUrl || undefined,
      variableMonth: expense?.variableMonth || new Date().getMonth() + 1,
      variableYear: expense?.variableYear || new Date().getFullYear(),
    },
  });

  const createMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest("POST", "/api/expenses", data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Erfolgreich", description: "Ausgabe erfolgreich hinzugefügt" });
      onClose();
      form.reset();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Hinzufügen der Ausgabe fehlgeschlagen", variant: "destructive" });
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertExpense) => {
      const response = await apiRequest("PUT", `/api/expenses/${expense.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/expenses"] });
      queryClient.invalidateQueries({ queryKey: ["/api/analytics"] });
      toast({ title: "Erfolgreich", description: "Ausgabe erfolgreich aktualisiert" });
      onClose();
    },
    onError: () => {
      toast({ title: "Fehler", description: "Aktualisierung der Ausgabe fehlgeschlagen", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertExpense) => {
    // Process data for income or regular expenses
    const processedData = {
      ...data,
      // For income items, set category to "Income" and icon to "trending-up"
      category: data.isIncome ? "Income" : data.category,
      icon: data.isIncome ? "trending-up" : ((data.icon === "default" || data.icon === "") ? null : data.icon)
    };
    
    if (expense) {
      updateMutation.mutate(processedData);
    } else {
      createMutation.mutate(processedData);
    }
  };

  const iconMap = {
    receipt: Receipt,
    home: Home,
    bolt: Zap,
    car: Car,
    utensils: Utensils,
    shield: Shield,
    play: Play,
    "shopping-cart": ShoppingCart,
    coffee: Coffee,
    plane: Plane,
    heart: Heart,
    book: Book,
    music: Music,
    gamepad: Gamepad,
    gift: Gift,
    phone: Phone,
    wifi: Wifi,
    "credit-card": CreditCard,
  };

  const iconOptions = [
    { value: "default", label: "Standard (Kategorie-Icon)", icon: null },
    { value: "receipt", label: "Quittung", icon: Receipt },
    { value: "home", label: "Zuhause", icon: Home },
    { value: "bolt", label: "Blitz", icon: Zap },
    { value: "car", label: "Auto", icon: Car },
    { value: "utensils", label: "Besteck", icon: Utensils },
    { value: "shield", label: "Schild", icon: Shield },
    { value: "play", label: "Abspielen", icon: Play },
    { value: "shopping-cart", label: "Einkaufen", icon: ShoppingCart },
    { value: "coffee", label: "Kaffee", icon: Coffee },
    { value: "plane", label: "Reisen", icon: Plane },
    { value: "heart", label: "Gesundheit", icon: Heart },
    { value: "book", label: "Bildung", icon: Book },
    { value: "music", label: "Musik", icon: Music },
    { value: "gamepad", label: "Gaming", icon: Gamepad },
    { value: "gift", label: "Geschenk", icon: Gift },
    { value: "phone", label: "Telefon", icon: Phone },
    { value: "wifi", label: "Internet", icon: Wifi },
    { value: "credit-card", label: "Zahlung", icon: CreditCard },
  ];

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{expense ? "Ausgabe bearbeiten" : "Neue Ausgabe hinzufügen"}</DialogTitle>
          <DialogDescription>
            {expense ? "Aktualisieren Sie die Ausgabendetails unten." : "Fügen Sie eine neue Haushaltsausgabe hinzu, um Kosten zu verfolgen und aufzuteilen."}
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Ausgabenname</FormLabel>
                  <FormControl>
                    <Input placeholder="z.B. Miete, Nebenkosten, Versicherung" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="amount"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Betrag</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        step="0.01" 
                        placeholder="0.00" 
                        {...field}
                        onChange={(e) => field.onChange(parseFloat(e.target.value) || 0)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {!form.watch("isVariable") && (
                <FormField
                  control={form.control}
                  name="frequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Häufigkeit</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Häufigkeit wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monthly">Monatlich</SelectItem>
                          <SelectItem value="quarterly">Quartalsweise</SelectItem>
                          <SelectItem value="semi-annually">Halbjährlich</SelectItem>
                          <SelectItem value="yearly">Jährlich</SelectItem>
                          <SelectItem value="one-time">Einmalige Zahlung</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
            </div>

            {!form.watch("isIncome") && (
              <FormField
                control={form.control}
                name="category"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Kategorie</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Kategorie wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories?.filter(category => category.name !== "Einkommen").map((category) => (
                          <SelectItem key={category.id} value={category.name}>
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!form.watch("isIncome") && !form.watch("imageUrl") && (
              <FormField
                control={form.control}
                name="icon"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Symbol</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || "receipt"}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Symbol wählen" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {iconOptions.map((iconOption) => (
                          <SelectItem key={iconOption.value} value={iconOption.value}>
                            <div className="flex items-center gap-2">
                              {iconOption.icon ? (
                                <iconOption.icon className="h-4 w-4" />
                              ) : (
                                <span className="w-4 h-4 flex items-center justify-center text-xs">•</span>
                              )}
                              {iconOption.label}
                            </div>
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            {!form.watch("isIncome") && (
              <FormField
                control={form.control}
                name="imageUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Bild-URL (optional)</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://beispiel.com/bild.jpg" 
                        {...field}
                        value={field.value || ""}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="isVariable"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dies ist eine variable Ausgabe</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            {form.watch("isVariable") && (
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="variableMonth"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Monat</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Monat wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="1">Januar</SelectItem>
                          <SelectItem value="2">Februar</SelectItem>
                          <SelectItem value="3">März</SelectItem>
                          <SelectItem value="4">April</SelectItem>
                          <SelectItem value="5">Mai</SelectItem>
                          <SelectItem value="6">Juni</SelectItem>
                          <SelectItem value="7">Juli</SelectItem>
                          <SelectItem value="8">August</SelectItem>
                          <SelectItem value="9">September</SelectItem>
                          <SelectItem value="10">Oktober</SelectItem>
                          <SelectItem value="11">November</SelectItem>
                          <SelectItem value="12">Dezember</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="variableYear"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Jahr</FormLabel>
                      <Select onValueChange={(value) => field.onChange(parseInt(value))} value={field.value?.toString()}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Jahr wählen" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="2025">2025</SelectItem>
                          <SelectItem value="2024">2024</SelectItem>
                          <SelectItem value="2023">2023</SelectItem>
                          <SelectItem value="2022">2022</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            )}

            <FormField
              control={form.control}
              name="isIncome"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <Checkbox
                      checked={field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Dies ist ein Einkommen (positiver Betrag)</FormLabel>
                  </div>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Abbrechen
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={createMutation.isPending || updateMutation.isPending}
              >
                Ausgabe {expense ? "aktualisieren" : "hinzufügen"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
