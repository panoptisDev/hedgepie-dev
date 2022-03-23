import React from 'react'
import { Box, Checkbox, Label, Image } from 'theme-ui'
import { Check } from 'react-feather'

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const TableRow = ({ data, onChange }) => {

  const [chekced, setChecked] = React.useState(false)

  const handleToggle = () => {
    setChecked(!chekced)
    onChange(!chekced)
  }

  return (
    <Box
      as="tr"
      sx={{
        backgroundColor: '#fff',
        cursor: 'pointer',
        transition: 'all .2s',
        userSelect: 'none',
        '&:active': {
          backgroundColor: '#f9f9f9'
        },
        '& td': {
          height: 80,
          color: '#8E8DA0',
          ':first-of-type': {
            borderBottomLeftRadius: 8,
          },
          ':last-of-type': {
            borderBottomRightRadius: 8
          }
        }
      }}
      onClick={handleToggle}
    >
      <td>
        <Box
          sx={{
            width: 18,
            height: 18,
            backgroundColor: '#fceecd',
            borderRadius: 2,
            marginLeft: 36
          }}
        >
          {chekced &&
            <Check size={18} color="#EFA906" />
          }
        </Box>
      </td>
      <td>
        <Image
          src={data.pie}
          sx={{
            width: 60
          }}
        />
      </td>
      <Box
        as="td"
        sx={{
          color: '#DF4886 !important'
        }}
      >
        ${numberWithCommas(data.tvl)}
      </Box>
      <td>
        {numberWithCommas(data.totalStaked)} TAKO
      </td>
      <td>
        {numberWithCommas(data.participants)}
      </td>
      <Box
        as="td"
        sx={{
          color: '#EFA906 !important'
        }}
      >
        {data.daily}%
      </Box>
      <td>
        {data.performanceFee}%
      </td>
      <td>
        {data.apy}%
      </td>
      <td>
        ${numberWithCommas(data.totalProfit)}
      </td>
    </Box>
  )
}

export default TableRow