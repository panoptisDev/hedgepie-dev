import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Line } from 'react-chartjs-2'
import { faker } from '@faker-js/faker'

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend)

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
      display: true,
      min: 0,
      max: 5000,
      stepSize: 1000,
    },
  },
}

const labels = ['April 2022', 'May 2022', 'Jun 2022', 'Jul 2022', 'Aug 2022']

export const data = {
  labels,
  datasets: [
    {
      label: 'Dataset 2',
      data: labels.map(() => faker.datatype.number({ min: 0, max: 5000 })),
      borderColor: '#90BE6D',
      backgroundColor: '#90BE6D',
      borderWidth: 5,
    },
  ],
}

const DashboardInvestmentChart = () => {
  return <Line options={options} data={data} />
}

export default DashboardInvestmentChart
