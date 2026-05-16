"use client";

import ReactEChartsCore from "echarts-for-react/lib/core";
import * as echarts from "echarts/core";
import { LineChart } from "echarts/charts";
import {
  GridComponent,
  TooltipComponent,
  LegendComponent,
} from "echarts/components";
import { CanvasRenderer } from "echarts/renderers";

echarts.use([LineChart, GridComponent, TooltipComponent, LegendComponent, CanvasRenderer]);

interface ActivityChartProps {
  role: "TEACHER" | "STUDENT";
}

const teacherData = {
  days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  submissions: [12, 19, 15, 23, 18, 8, 3],
  activeStudents: [8, 14, 11, 18, 15, 6, 2],
  newDiscussions: [3, 5, 2, 7, 4, 1, 0],
};

const studentData = {
  days: ["周一", "周二", "周三", "周四", "周五", "周六", "周日"],
  studyHours: [2.5, 3.0, 1.8, 4.2, 3.5, 2.0, 1.0],
  completedTasks: [3, 5, 2, 7, 4, 2, 1],
  quizScores: [85, 92, 78, 95, 88, 80, 75],
};

export function ActivityChart({ role }: ActivityChartProps) {
  const isTeacher = role === "TEACHER";

  const days = isTeacher ? teacherData.days : studentData.days;

  const series = isTeacher
    ? [
        {
          name: "作业提交",
          type: "line" as const,
          data: teacherData.submissions,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#3b82f6", width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(59,130,246,0.2)" },
              { offset: 1, color: "rgba(59,130,246,0)" },
            ]),
          },
        },
        {
          name: "活跃学生",
          type: "line" as const,
          data: teacherData.activeStudents,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#10b981", width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16,185,129,0.2)" },
              { offset: 1, color: "rgba(16,185,129,0)" },
            ]),
          },
        },
        {
          name: "新增讨论",
          type: "line" as const,
          data: teacherData.newDiscussions,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#f59e0b", width: 2 },
        },
      ]
    : [
        {
          name: "学习时长 (h)",
          type: "line" as const,
          data: studentData.studyHours,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#8b5cf6", width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(139,92,246,0.2)" },
              { offset: 1, color: "rgba(139,92,246,0)" },
            ]),
          },
        },
        {
          name: "完成任务",
          type: "line" as const,
          data: studentData.completedTasks,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#10b981", width: 2 },
          areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1, [
              { offset: 0, color: "rgba(16,185,129,0.2)" },
              { offset: 1, color: "rgba(16,185,129,0)" },
            ]),
          },
        },
        {
          name: "测验得分",
          type: "line" as const,
          data: studentData.quizScores,
          smooth: true,
          symbol: "circle" as const,
          symbolSize: 6,
          lineStyle: { color: "#f59e0b", width: 2 },
        },
      ];

  const option = {
    tooltip: {
      trigger: "axis",
      backgroundColor: "hsl(var(--card))",
      borderColor: "hsl(var(--border))",
      textStyle: { color: "hsl(var(--card-foreground))", fontSize: 12 },
    },
    legend: {
      bottom: 0,
      textStyle: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
      itemWidth: 10,
      itemHeight: 10,
    },
    grid: { top: 8, right: 8, bottom: 32, left: 36 },
    xAxis: {
      type: "category",
      data: days,
      axisLine: { lineStyle: { color: "hsl(var(--border))" } },
      axisTick: { show: false },
      axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
    },
    yAxis: {
      type: "value",
      splitLine: { lineStyle: { color: "hsl(var(--border))", type: "dashed" } },
      axisLabel: { color: "hsl(var(--muted-foreground))", fontSize: 11 },
    },
    series,
  };

  return (
    <div className="flex flex-col h-full">
      <div className="text-sm font-semibold mb-1">
        {role === "TEACHER" ? "教学活跃度（近7日）" : "学习活跃度（近7日）"}
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
