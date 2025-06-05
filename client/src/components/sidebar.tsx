import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Plus, PieChart, List, TrendingUp, Settings } from "lucide-react";
import { ExpenseModal } from "./expense-modal";
import { SplitSettingsModal } from "./split-settings-modal";
import type { SplitSettings } from "@shared/schema";

interface SidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
}

export function Sidebar({ activeTab, onTabChange }: SidebarProps) {
  const [isExpenseModalOpen, setIsExpenseModalOpen] = useState(false);
  const [isSplitModalOpen, setIsSplitModalOpen] = useState(false);
  const [location] = useLocation();

  const { data: splitSettings } = useQuery<SplitSettings>({
    queryKey: ["/api/split-settings"],
  });

  const navItems = [
    { id: "dashboard", label: "Übersicht", icon: PieChart, path: "/dashboard" },
    { id: "expenses", label: "Alle Ausgaben", icon: List, path: "/expenses" },
    { id: "analytics", label: "Auswertungen", icon: TrendingUp, path: "/analytics" },
    { id: "settings", label: "Einstellungen", icon: Settings, path: "/settings" },
  ];

  return (
    <>
      <div className="w-64 bg-white dark:bg-slate-800 shadow-lg border-r border-slate-200 dark:border-slate-700 fixed h-full">
        <div className="p-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100">Ausgaben Tracker</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Ausgabenverwaltung</p>
        </div>
        
        <nav className="mt-6">
          <div className="px-6 mb-6">
            <Button 
              onClick={() => setIsExpenseModalOpen(true)}
              className="w-full bg-primary text-white px-4 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors flex items-center justify-center gap-2"
            >
              <Plus className="h-4 w-4" />
              Ausgabe hinzufügen
            </Button>
          </div>
          
          <div className="space-y-1 px-3">
            {navItems.map((item) => {
              const Icon = item.icon;
              const isActive = location === item.path || (location === "/" && item.id === "dashboard");
              
              return (
                <Link key={item.id} href={item.path}>
                  <button
                    className={`flex items-center gap-3 px-3 py-2 w-full text-left rounded-lg font-medium transition-colors ${
                      isActive 
                        ? "text-primary bg-blue-50 dark:bg-blue-900/20" 
                        : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    {item.label}
                  </button>
                </Link>
              );
            })}
          </div>
        </nav>
        
        {splitSettings && (
          <Card className="mx-6 mt-8 bg-slate-50 dark:bg-slate-700">
            <CardContent className="p-4">
              <h3 className="font-semibold text-slate-800 dark:text-slate-100 mb-3">Aktuelle Aufteilung</h3>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{splitSettings.user1Name}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{splitSettings.user1Percentage}%</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-slate-600 dark:text-slate-300">{splitSettings.user2Name}</span>
                  <span className="font-medium text-slate-800 dark:text-slate-100">{splitSettings.user2Percentage}%</span>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSplitModalOpen(true)}
                className="w-full mt-3 text-xs text-primary hover:text-blue-600 font-medium"
              >
                Aufteilung bearbeiten
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
      <ExpenseModal 
        isOpen={isExpenseModalOpen}
        onClose={() => setIsExpenseModalOpen(false)}
      />
      <SplitSettingsModal
        isOpen={isSplitModalOpen}
        onClose={() => setIsSplitModalOpen(false)}
      />
    </>
  );
}
