'use client'

import { BarChart, LineChart, PieChart } from 'echarts/charts'
import { GridComponent, LegendComponent, TooltipComponent } from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useEffect, useRef } from 'react'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
import type {
  GridComponentOption,
  LegendComponentOption,
  TooltipComponentOption,
} from 'echarts/components'

echarts.use([
  BarChart,
  CanvasRenderer,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  TooltipComponent,
])

type StatsChartOption = ComposeOption<
  | BarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
  | PieSeriesOption
  | TooltipComponentOption
>

function getChartTheme(element: HTMLElement) {
  const style = getComputedStyle(element)
  const border = style.getPropertyValue('--border')
  const background = style.getPropertyValue('--popover')
  const foreground = style.getPropertyValue('--foreground')
  const muted = style.getPropertyValue('--muted-foreground')
  const fontFamily = style.fontFamily

  return {
    border,
    fontFamily,
    foreground,
    muted,
    primary: style.getPropertyValue('--chart-1'),
    green: style.getPropertyValue('--chart-2'),
    yellow: style.getPropertyValue('--chart-4'),
    red: style.getPropertyValue('--chart-5'),
    axis: {
      axisLabel: { color: muted, fontFamily, fontSize: 11 },
      axisLine: { lineStyle: { color: border } },
      axisTick: { show: false },
      splitLine: { lineStyle: { color: border, type: 'dashed' as const } },
    },
    tooltip: {
      backgroundColor: background,
      borderColor: border,
      textStyle: { color: foreground, fontFamily, fontSize: 12 },
    },
  }
}

export type BuildStatsChartOption = (theme: ReturnType<typeof getChartTheme>) => StatsChartOption

export function StatsChart({
  className = 'h-64',
  description,
  option,
}: {
  className?: string
  description: string
  option: BuildStatsChartOption
}) {
  const chartElement = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartElement.current) return

    const chart = echarts.init(chartElement.current, undefined, { renderer: 'canvas' })
    chart.setOption(option(getChartTheme(chartElement.current)))
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartElement.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [option])

  return <div aria-label={description} className={className} ref={chartElement} role="img" />
}
