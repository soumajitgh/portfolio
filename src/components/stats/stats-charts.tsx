'use client'

import { useCallback } from 'react'

import { StatsChart, type BuildStatsChartOption } from './stats-chart'

export function DifficultyChart({
  easy,
  hard,
  medium,
}: {
  easy: number
  hard: number
  medium: number
}) {
  const option = useCallback<BuildStatsChartOption>(
    ({ border, fontFamily, foreground, green, muted, red, tooltip, yellow }) => ({
      color: [green, yellow, red],
      legend: {
        bottom: 0,
        icon: 'circle',
        itemHeight: 7,
        itemWidth: 7,
        textStyle: { color: muted, fontFamily, fontSize: 10 },
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
          itemStyle: { borderColor: border, borderWidth: 3 },
          label: { color: foreground, fontFamily, formatter: '{c}' },
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
  const option = useCallback<BuildStatsChartOption>(
    ({ axis, primary, tooltip }) => {
      const visible = items.slice(0, 7)

      return {
        color: [primary],
        grid: { bottom: 18, containLabel: true, left: 8, right: 12, top: 8 },
        series: [
          {
            barMaxWidth: 16,
            data: visible.map((item) => item.value),
            itemStyle: { borderRadius: [0, 4, 4, 0] },
            type: 'bar',
          },
        ],
        tooltip: {
          ...tooltip,
          trigger: 'axis',
          valueFormatter: (value) => `${value} ${valueLabel}`,
        },
        xAxis: { ...axis, minInterval: 1, type: 'value' },
        yAxis: {
          ...axis,
          axisLabel: { ...axis.axisLabel, width: 90, overflow: 'truncate' },
          data: visible.map((item) => item.name),
          inverse: true,
          type: 'category',
        },
      }
    },
    [items, valueLabel],
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
  const option = useCallback<BuildStatsChartOption>(
    ({ axis, green, tooltip }) => {
      const recent = days.slice(-52)

      return {
        color: [green],
        grid: { bottom: 26, containLabel: true, left: 8, right: 12, top: 14 },
        series: [
          {
            areaStyle: { opacity: 0.14 },
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
      }
    },
    [days, noun],
  )

  return (
    <StatsChart
      className="h-64"
      description={`${noun} across ${Math.min(days.length, 52)} recent activity dates`}
      option={option}
    />
  )
}
