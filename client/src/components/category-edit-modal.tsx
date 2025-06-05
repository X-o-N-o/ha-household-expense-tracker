import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertCategorySchema, type InsertCategory, type Category } from "@shared/schema";
import { Save } from "lucide-react";

interface CategoryEditModalProps {
  isOpen: boolean;
  onClose: () => void;
  category: Category;
}

const iconOptions = [
  { value: "home", label: "Home" },
  { value: "bolt", label: "Lightning" },
  { value: "car", label: "Car" },
  { value: "utensils", label: "Utensils" },
  { value: "shield", label: "Shield" },
  { value: "play", label: "Play" },
  { value: "tag", label: "Tag" },
  { value: "heart", label: "Heart" },
  { value: "shopping-cart", label: "Shopping Cart" },
  { value: "gift", label: "Gift" },
  { value: "coffee", label: "Coffee" },
  { value: "plane", label: "Plane" },
  { value: "book", label: "Book" },
  { value: "music", label: "Music" },
  { value: "gamepad", label: "Game" },
];

const colorOptions = [
  { value: "red", label: "Red", classes: "bg-red-100 text-red-500 dark:bg-red-900/20 dark:text-red-400" },
  { value: "blue", label: "Blue", classes: "bg-blue-100 text-blue-500 dark:bg-blue-900/20 dark:text-blue-400" },
  { value: "green", label: "Green", classes: "bg-green-100 text-green-500 dark:bg-green-900/20 dark:text-green-400" },
  { value: "orange", label: "Orange", classes: "bg-orange-100 text-orange-500 dark:bg-orange-900/20 dark:text-orange-400" },
  { value: "purple", label: "Purple", classes: "bg-purple-100 text-purple-500 dark:bg-purple-900/20 dark:text-purple-400" },
  { value: "pink", label: "Pink", classes: "bg-pink-100 text-pink-500 dark:bg-pink-900/20 dark:text-pink-400" },
  { value: "yellow", label: "Yellow", classes: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/20 dark:text-yellow-400" },
  { value: "indigo", label: "Indigo", classes: "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/20 dark:text-indigo-400" },
  { value: "emerald", label: "Emerald", classes: "bg-emerald-100 text-emerald-600 dark:bg-emerald-900/20 dark:text-emerald-400" },
  { value: "gray", label: "Gray", classes: "bg-gray-100 text-gray-500 dark:bg-gray-800 dark:text-gray-400" },
];

export function CategoryEditModal({ isOpen, onClose, category }: CategoryEditModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<InsertCategory>({
    resolver: zodResolver(insertCategorySchema),
    defaultValues: {
      name: category.name,
      icon: category.icon,
      color: category.color,
    },
  });

  const updateMutation = useMutation({
    mutationFn: async (data: InsertCategory) => {
      const response = await apiRequest("PUT", `/api/categories/${category.id}`, data);
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
      toast({ title: "Success", description: "Category updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update category", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertCategory) => {
    updateMutation.mutate(data);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Category</DialogTitle>
          <DialogDescription>
            Update the category name, icon, and color settings.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Category name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="icon"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Icon</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select an icon" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {iconOptions.map((icon) => (
                        <SelectItem key={icon.value} value={icon.value}>
                          <div className="flex items-center gap-2">
                            <i className={`fas fa-${icon.value}`}></i>
                            {icon.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="color"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Color</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select a color" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {colorOptions.map((color) => (
                        <SelectItem key={color.value} value={color.value}>
                          <div className="flex items-center gap-2">
                            <div className={`w-4 h-4 rounded ${color.classes}`}></div>
                            {color.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1 bg-green-600 hover:bg-green-700 text-white"
                disabled={updateMutation.isPending}
              >
                <Save className="h-4 w-4 mr-2" />
                Save Changes
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}