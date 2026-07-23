'use client'

import { useMemo } from 'react'

import type { DailyActivity, Metric } from '@/lib/stats-data'

import { StatsChart, type StatsChartOption } from './stats-chart'

const colors = ['#61afef', '#98c379', '#c678dd', '#e5c07b', '#56b6c2', '#e06c75']
const axis = {
  axisLabel: { color: '#8d96a6', fontFamily: 'JetBrains Mono', fontSize: 10 },
  axisLine: { lineStyle: { color: '#414855' } },
  axisTick: { show: false },
  splitLine: { lineStyle: { color: '#333946', type: 'dashed' as const } },
}
const tooltip = {
  backgroundColor: '#272c35',
  borderColor: '#414855',
  textStyle: { color: '#d2d6dc', fontFamily: 'JetBrains Mono', fontSize: 11 },
}

const hours = (seconds: number) => Math.round((seconds / 3600) * 10) / 10

export function DifficultyChart({
  easy,
  hard,
  medium,
}: {
  easy: number
  hard: number
  medium: number
}) {
  const option = useMemo<StatsChartOption>(
    () => ({
      color: ['#98c379', '#e5c07b', '#e06c75'],
      legend: {
        bottom: 0,
        icon: 'circle',
        itemHeight: 7,
        itemWidth: 7,
        textStyle: { color: '#8d96a6', fontFamily: 'JetBrains Mono', fontSize: 10 },
      },
      series: [
        {
          center: ['50%', '43%'],
          data: [
            { name: 'Easy', value: easy },
            { name: 'Medium', value: medium },
            { name: 'Hard', value: hard },
          ],
          emphasis: { scaleSize: 4 },
          itemStyle: { borderColor: '#272c35', borderWidth: 3 },
          label: { color: '#d2d6dc', fontFamily: 'JetBrains Mono', formatter: '{c}' },
          radius: ['56%', '76%'],
          type: 'pie',
        },
      ],
      tooltip: { ...tooltip, trigger: 'item', valueFormatter: (value) => `${value} solved` },
    }),
    [easy, hard, medium],
  )

  return (
    <StatsChart
      className="h-52"
      description={`${easy} easy, ${medium} medium, and ${hard} hard LeetCode problems solved`}
      option={option}
    />
  )
}

export function LanguageChart({
  items,
  valueLabel,
}: {
  items: { name: string; value: number }[]
  valueLabel: string
}) {
  const visible = items.slice(0, 7)
  const option = useMemo<StatsChartOption>(
    () => ({
      color: ['#61afef'],
      grid: { bottom: 18, containLabel: true, left: 8, right: 12, top: 8 },
      series: [
        {
          barMaxWidth: 16,
          data: visible.map((item) => item.value),
          itemStyle: { borderRadius: [0, 4, 4, 0] },
          type: 'bar',
        },
      ],
      tooltip: { ...tooltip, trigger: 'axis', valueFormatter: (value) => `${value} ${valueLabel}` },
      xAxis: { ...axis, minInterval: 1, type: 'value' },
      yAxis: {
        ...axis,
        axisLabel: { ...axis.axisLabel, width: 90, overflow: 'truncate' },
        data: visible.map((item) => item.name),
        inverse: true,
        type: 'category',
      },
    }),
    [valueLabel, visible],
  )

  return (
    <StatsChart
      className="h-64"
      description={`Most used languages by ${valueLabel}`}
      option={option}
    />
  )
}

export function ContributionChart({
  days,
  noun = 'contributions',
}: {
  days: { count: number; date: string }[]
  noun?: string
}) {
  const recent = days.slice(-52)
  const option = useMemo<StatsChartOption>(
    () => ({
      color: ['#98c379'],
      grid: { bottom: 26, containLabel: true, left: 8, right: 12, top: 14 },
      series: [
        {
          areaStyle: { color: 'rgba(152, 195, 121, 0.14)' },
          data: recent.map((item) => item.count),
          lineStyle: { width: 2 },
          showSymbol: false,
          smooth: 0.25,
          type: 'line',
        },
      ],
      tooltip: { ...tooltip, trigger: 'axis', valueFormatter: (value) => `${value} ${noun}` },
      xAxis: {
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          formatter: (value: string) =>
            new Date(`${value}T00:00:00`).toLocaleDateString('en', {
              day: 'numeric',
              month: 'short',
            }),
          interval: Math.max(Math.floor(recent.length / 5) - 1, 0),
        },
        boundaryGap: false,
        data: recent.map((item) => item.date),
        type: 'category',
      },
      yAxis: { ...axis, minInterval: 1, type: 'value' },
    }),
    [noun, recent],
  )

  return (
    <StatsChart
      className="h-64"
      description={`${noun} over the most recent 52 active days`}
      option={option}
    />
  )
}

export function WakaTimeCharts({
  daily,
  editors,
  languages,
  projects,
}: {
  daily: DailyActivity[]
  editors: Metric[]
  languages: Metric[]
  projects: Metric[]
}) {
  const modeItems = useMemo(
    () => [
      ...languages.slice(0, 4).map((item) => ({ ...item, color: colors[1], kind: 'language' })),
      ...editors.slice(0, 3).map((item) => ({ ...item, color: colors[2], kind: 'editor' })),
    ],
    [editors, languages],
  )
  const activityOption = useMemo<StatsChartOption>(
    () => ({
      color: [colors[0]],
      grid: { bottom: 24, containLabel: true, left: 8, right: 12, top: 12 },
      series: [
        {
          areaStyle: { color: 'rgba(97, 175, 239, 0.16)' },
          data: daily.map((item) => hours(item.seconds)),
          lineStyle: { width: 2 },
          showSymbol: false,
          smooth: 0.3,
          type: 'line',
        },
      ],
      tooltip: { ...tooltip, trigger: 'axis', valueFormatter: (value) => `${value} hours` },
      xAxis: {
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          formatter: (value: string) =>
            new Date(`${value}T00:00:00`).toLocaleDateString('en', {
              day: 'numeric',
              month: 'short',
            }),
          interval: Math.max(Math.floor(daily.length / 5) - 1, 0),
        },
        boundaryGap: false,
        data: daily.map((item) => item.date),
        type: 'category',
      },
      yAxis: {
        ...axis,
        axisLabel: { ...axis.axisLabel, formatter: '{value}h' },
        type: 'value',
      },
    }),
    [daily],
  )
  const projectsOption = useMemo<StatsChartOption>(
    () => ({
      color: colors,
      legend: {
        bottom: 0,
        icon: 'circle',
        itemGap: 12,
        itemHeight: 7,
        itemWidth: 7,
        textStyle: { color: '#8d96a6', fontFamily: 'JetBrains Mono', fontSize: 9 },
      },
      series: [
        {
          center: ['50%', '43%'],
          data: projects.slice(0, 5).map((item) => ({
            name: item.name,
            value: hours(item.seconds),
          })),
          itemStyle: { borderColor: '#272c35', borderWidth: 3 },
          label: { show: false },
          radius: ['50%', '72%'],
          type: 'pie',
        },
      ],
      tooltip: { ...tooltip, trigger: 'item', valueFormatter: (value) => `${value} hours` },
    }),
    [projects],
  )
  const modesOption = useMemo<StatsChartOption>(
    () => ({
      color: [colors[1], colors[2]],
      grid: { bottom: 18, containLabel: true, left: 8, right: 12, top: 12 },
      series: [
        {
          barMaxWidth: 16,
          data: modeItems.map((item) => ({
            itemStyle: { borderRadius: 4, color: item.color },
            value: item.percent,
          })),
          type: 'bar',
        },
      ],
      tooltip: { ...tooltip, trigger: 'axis', valueFormatter: (value) => `${value}%` },
      xAxis: {
        ...axis,
        axisLabel: { ...axis.axisLabel, formatter: '{value}%' },
        max: 100,
        type: 'value',
      },
      yAxis: {
        ...axis,
        axisLabel: {
          ...axis.axisLabel,
          formatter: (value: string, index: number) => `${value} · ${modeItems[index]?.kind}`,
        },
        data: modeItems.map((item) => item.name),
        inverse: true,
        type: 'category',
      },
    }),
    [modeItems],
  )

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="rounded-lg border border-border/70 bg-background/25 p-3">
        <p className="font-mono text-xs text-muted-foreground">activity / 14 days</p>
        <StatsChart
          className="h-60"
          description="Daily WakaTime coding activity over the last 14 days"
          option={activityOption}
        />
      </div>
      <div className="rounded-lg border border-border/70 bg-background/25 p-3">
        <p className="font-mono text-xs text-muted-foreground">project allocation / 7 days</p>
        <StatsChart
          className="h-60"
          description="WakaTime hours distributed across active projects"
          option={projectsOption}
        />
      </div>
      <div className="rounded-lg border border-border/70 bg-background/25 p-3 lg:col-span-2">
        <p className="font-mono text-xs text-muted-foreground">
          languages / editor modes
        </p>
        <StatsChart
          className="h-56"
          description="WakaTime language share across the most used languages"
          option={modesOption}
        />
      </div>
    </div>
  )
}
