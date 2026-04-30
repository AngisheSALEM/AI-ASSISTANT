"use client";

import { AreaChart } from "@/components/ui/TremorComponents";

interface DashboardAreaChartProps {
  data: {
    date: string;
    Messages: number;
  }[];
  className?: string;
}

export function DashboardAreaChart({ data, className }: DashboardAreaChartProps) {
  return (
    <AreaChart
      className={className}
      data={data}
      index="date"
      categories={["Messages"]}
      colors={["blue"]}
      valueFormatter={(number: number) =>
        Intl.NumberFormat("us").format(number).toString()
      }
    />
  );
}
