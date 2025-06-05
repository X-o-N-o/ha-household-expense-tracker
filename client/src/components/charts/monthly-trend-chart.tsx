import { useState } from "react";
import { Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { formatCurrency } from "@/lib/utils";

interface MonthlyTrendChartProps {
  data: Array<{ month: string; amount: number }>;
}

export function MonthlyTrendChart({ data }: MonthlyTrendChartProps) {
  const [selectedPeriod, setSelectedPeriod] = useState("12months");

  // Filter data based on selected period
  const filteredData = (() => {
    switch (selectedPeriod) {
      case "6months":
        return data.slice(-6);
      case "year":
        return data.slice(-12);
      case "12months":
      default:
        return data;
    }
  })();

  return (
    <Card>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="text-lg font-semibold text-slate-800 dark:text-slate-200">
            Monatlicher Ausgabentrend
          </CardTitle>
          <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="12months">Letzte 12 Monate</SelectItem>
              <SelectItem value="6months">Letzte 6 Monate</SelectItem>
              <SelectItem value="year">Dieses Jahr</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </CardHeader>
      <CardContent>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={filteredData}>
              <XAxis 
                dataKey="month" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
              />
              <YAxis 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 12, fill: "#64748b" }}
                tickFormatter={(value) => `$${value.toLocaleString()}`}
              />
              <Tooltip 
                content={({ active, payload, label }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-white p-3 border border-slate-200 rounded-lg shadow-sm">
                        <p className="font-medium text-slate-800">{label}</p>
                        <p className="text-sm text-slate-600">
                          {formatCurrency(payload[0].value as number)}
                        </p>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <Line 
                type="monotone" 
                dataKey="amount" 
                stroke="#3B82F6"
                strokeWidth={3}
                dot={{ fill: "#3B82F6", strokeWidth: 2, r: 4 }}
                activeDot={{ r: 6, fill: "#3B82F6" }}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
