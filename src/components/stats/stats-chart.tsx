'use client'

import { BarChart, LineChart, PieChart } from 'echarts/charts'
import {
  DatasetComponent,
  GridComponent,
  LegendComponent,
  TitleComponent,
  TooltipComponent,
} from 'echarts/components'
import * as echarts from 'echarts/core'
import { CanvasRenderer } from 'echarts/renderers'
import { useEffect, useRef } from 'react'
import type { ComposeOption } from 'echarts/core'
import type { BarSeriesOption, LineSeriesOption, PieSeriesOption } from 'echarts/charts'
import type {
  DatasetComponentOption,
  GridComponentOption,
  LegendComponentOption,
  TitleComponentOption,
  TooltipComponentOption,
} from 'echarts/components'

echarts.use([
  BarChart,
  CanvasRenderer,
  DatasetComponent,
  GridComponent,
  LegendComponent,
  LineChart,
  PieChart,
  TitleComponent,
  TooltipComponent,
])

export type StatsChartOption = ComposeOption<
  | BarSeriesOption
  | DatasetComponentOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
  | PieSeriesOption
  | TitleComponentOption
  | TooltipComponentOption
>

export function StatsChart({
  className = 'h-64',
  description,
  option,
}: {
  className?: string
  description: string
  option: StatsChartOption
}) {
  const chartElement = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!chartElement.current) return

    const chart = echarts.init(chartElement.current, undefined, { renderer: 'canvas' })
    chart.setOption(option)
    const resizeObserver = new ResizeObserver(() => chart.resize())
    resizeObserver.observe(chartElement.current)

    return () => {
      resizeObserver.disconnect()
      chart.dispose()
    }
  }, [option])

  return (
    <div
      aria-label={description}
      className={className}
      ref={chartElement}
      role="img"
    />
  )
}
