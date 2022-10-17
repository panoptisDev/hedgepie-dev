import React, { useState, useEffect } from 'react'
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js'
import { Doughnut } from 'react-chartjs-2'

ChartJS.register(ArcElement, Tooltip, Legend)

export const options = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      display: false,
      position: 'top' as const,
    },
    title: {
      display: false,
    },
  },
  scales: {
    yAxis: {
      display: false,
    },
  },
}

export const CHART_DATA = {
  labels: ['Red', 'Blue', 'Yellow', 'Green', 'Purple', 'Orange'],
  datasets: [
    {
      label: 'YBNFT',
      data: [4, 4, 8],
      backgroundColor: ['red', 'orange', '#2e8bc0'],
      borderColor: ['red', 'orange', '#2e8bc0'],
      borderWidth: 1,
    },
  ],
}

const YieldStakeDoughnut = (props: { data?: any; labels?: string[] }) => {
  const { data, labels } = props
  const [chartData, setChartData] = useState<any>(CHART_DATA)
  useEffect(() => {
    data && labels && setChartData({ labels: labels, datasets: [data] })
  }, [data, labels])

  return chartData ? <Doughnut data={chartData} options={options} /> : <></>
}

export default YieldStakeDoughnut
