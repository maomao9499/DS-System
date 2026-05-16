"use client";

import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { PieChart } from "echarts/charts";
import { LegendComponent, TooltipComponent } from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([PieChart, LegendComponent, TooltipComponent, CanvasRenderer]);

interface ResourceChartProps {
  role: "TEACHER" | "STUDENT";
}

const teacherResource = [
  { value: 45, name: "课程资源" },
  { value: 25, name: "数据集存储" },
  { value: 18, name: "作业批改" },
  { value: 12, name: "讨论互动" },
];

const studentResource = [
  { value: 40, name: "实训任务" },
  { value: 30, name: "课程学习" },
  { value: 20, name: "AI 对话" },
  { value: 10, name: "数据集下载" },
];

export function ResourceChart({ role }: ResourceChartProps) {
  const data = role === "TEACHER" ? teacherResource : studentResource;

  const option = {
    tooltip: {
      trigger: "item",
      backgroundColor: "hsl(var(--card))",
      borderColor: "hsl(var(--border))",
      textStyle: { color: "hsl(var(--card-foreground))", fontSize: 12 },
      formatter: "{b}: {c}% ({d}%)",
    },
    legend: {
      bottom: 0,
      textStyle: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    series: [
      {
        type: "pie",
        radius: ["55%", "80%"],
        center: ["50%", "43%"],
        avoidLabelOverlap: false,
        itemStyle: {
          borderRadius: 4,
          borderColor: "hsl(var(--background))",
          borderWidth: 2,
        },
        label: { show: false },
        emphasis: {
          label: { show: true, fontSize: 14, fontWeight: "bold" },
          scaleSize: 8,
        },
        data,
        color: ["#3b82f6", "#10b981", "#f59e0b", "#8b5cf6"],
      },
    ],
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold mb-1">
        {role === "TEACHER" ? "实训资源消耗分布" : "个人学习投入分布"}
      </div>
      <div className="flex-1 min-h-0">
        <ReactEChartsCore
          echarts={echarts}
          option={option}
          style={{ height: "100%", width: "100%" }}
          notMerge
        />
      </div>
    </div>
  );
}
