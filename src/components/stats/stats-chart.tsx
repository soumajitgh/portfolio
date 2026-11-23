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

export type StatsChartOption = ComposeOption<
  | BarSeriesOption
  | GridComponentOption
  | LegendComponentOption
  | LineSeriesOption
  | PieSeriesOption
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

  return <div aria-label={description} className={className} ref={chartElement} role="img" />
}
