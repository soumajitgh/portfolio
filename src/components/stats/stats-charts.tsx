'use client'

import { useMemo } from 'react'

import { StatsChart, type StatsChartOption } from './stats-chart'

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
      description={`${noun} across ${recent.length} recent activity dates`}
      option={option}
    />
  )
}
