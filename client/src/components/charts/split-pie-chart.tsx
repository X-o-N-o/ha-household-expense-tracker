import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { formatCurrency } from "@/lib/utils";
import { useQuery } from "@tanstack/react-query";
import type { Category } from "@shared/schema";

interface SplitPieChartProps {
  data: Array<{ name: string; value: number; amount: number; color?: string }>;
}

// Helper function to convert CSS color classes to hex colors for charts
function getHexColorFromCategory(categoryColor: string): string {
  const colorMap: Record<string, string> = {
    "red": "#EF4444",
    "blue": "#3B82F6", 
    "green": "#10B981",
    "orange": "#F97316",
    "purple": "#8B5CF6",
    "pink": "#EC4899",
    "yellow": "#F59E0B",
    "indigo": "#6366F1",
    "emerald": "#10B981",
    "gray": "#6B7280",
  };
  return colorMap[categoryColor] || "#6B7280";
}

export function SplitPieChart({ data }: SplitPieChartProps) {
  const { data: categoriesDB } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Helper function to get current hex color from database
  const getHexColorFromDB = (categoryName: string): string => {
    const category = categoriesDB?.find(cat => cat.name === categoryName);
    const colorName = category?.color || "gray";
    return getHexColorFromCategory(colorName);
  };

  return (
    <Card className="bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700">
      <CardHeader>
        <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
          Aufschlüsselung der Ausgabenkategorien
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-center h-64">
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={5}
                dataKey="value"
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={getHexColorFromDB(entry.name)} />
                ))}
              </Pie>
              <Tooltip 
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-white dark:bg-slate-800 p-3 border border-slate-200 dark:border-slate-600 rounded-lg shadow-sm">
                        <p className="font-medium text-slate-800 dark:text-slate-200">{data.name}</p>
                        <p className="text-sm text-slate-600 dark:text-slate-400">
                          {formatCurrency(data.amount)} ({data.value}%)
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
            </PieChart>
          </ResponsiveContainer>
        </div>
        
        <div className="mt-6 space-y-3">
          {data.map((item, index) => (
            <div key={item.name} className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div 
                  className="w-3 h-3 rounded-full" 
                  style={{ backgroundColor: getHexColorFromCategory(item.color || "gray") }}
                />
                <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
              </div>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {formatCurrency(item.amount)} ({item.value}%)
              </span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
