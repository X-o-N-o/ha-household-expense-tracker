import { useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertSplitSettingsSchema, type InsertSplitSettings, type SplitSettings } from "@shared/schema";

interface SplitSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SplitSettingsModal({ isOpen, onClose }: SplitSettingsModalProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: splitSettings } = useQuery<SplitSettings>({
    queryKey: ["/api/split-settings"],
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

  // Update form when splitSettings loads using useEffect
  useEffect(() => {
    if (splitSettings && !form.formState.isDirty) {
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
      toast({ title: "Success", description: "Split settings updated successfully" });
      onClose();
    },
    onError: () => {
      toast({ title: "Error", description: "Failed to update split settings", variant: "destructive" });
    },
  });

  const onSubmit = (data: InsertSplitSettings) => {
    // Ensure percentages add up to 100
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

  // Watch percentage changes to auto-adjust the other
  const user1Percentage = form.watch("user1Percentage");
  
  const handleUser1PercentageChange = (value: number) => {
    form.setValue("user1Percentage", value);
    form.setValue("user2Percentage", 100 - value);
  };

  const handleUser2PercentageChange = (value: number) => {
    form.setValue("user2Percentage", value);
    form.setValue("user1Percentage", 100 - value);
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Edit Split Settings</DialogTitle>
          <DialogDescription>
            Configure how expenses are split between household members.
          </DialogDescription>
        </DialogHeader>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user1Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Your name" {...field} />
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
                    <FormLabel>Prozentsatz</FormLabel>
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
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="user2Name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Second Person</FormLabel>
                    <FormControl>
                      <Input placeholder="Partner's name" {...field} />
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
                    <FormLabel>Prozentsatz</FormLabel>
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
            </div>

            <div className="text-sm text-slate-600 bg-slate-50 p-3 rounded-lg">
              <p>Gesamt: {(form.watch("user1Percentage") || 0) + (form.watch("user2Percentage") || 0)}%</p>
              <p className="text-xs mt-1">Prozentsätze müssen genau 100% ergeben</p>
            </div>

            <div className="flex gap-3 pt-4">
              <Button type="button" variant="outline" onClick={onClose} className="flex-1">
                Cancel
              </Button>
              <Button 
                type="submit" 
                className="flex-1"
                disabled={updateMutation.isPending}
              >
                Update Split
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
