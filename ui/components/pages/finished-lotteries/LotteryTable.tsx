import React from "react"
import { Box, Button, Image } from "theme-ui"
import { ChevronDown } from 'react-feather';

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",")
}

const LotteryTable = ({ data, onSort, sortKey }: any) => {

  const handleSort = (sortType: string) => {
    onSort(sortType)
  }

  return (
    <Box
      sx={{
        overflow: 'auto',
        '& th': {
          textAlign: 'left',
          padding: 20,
          fontSize: 14,
          fontWeight: 400,
          whiteSpace: 'nowrap'
        },
        '& td': {
          textAlign: 'left',
          padding: 20,
          fontSize: 14,
          whiteSpace: 'nowrap'
        },
        '& tbody td': {
          color: '#8E8DA0',
        },
        '& tbody tr:nth-of-type(odd)': {
          backgroundColor: '#E5F6FF'
        }
      }}
    >
      <table
        style={{
          width: '100%',
          borderSpacing: 0
        }}
      >
        <thead>
          <tr>
            <th style={{ width: 100 }}>
              HedgePies
            </th>
            <th>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleSort('tvl')}
              >
                <Box
                  sx={{
                    fontWeight: sortKey === 'tvl' ? 500 : 400
                  }}
                >
                  TVL
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th>
              TOTAL STAKED
            </th>
            <th>
              # OF PARTICIPANTS
            </th>
            <th>
              DAILY
            </th>
            <th>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleSort('apy')}
              >
                <Box
                  sx={{
                    fontWeight: sortKey === 'apy' ? 500 : 400
                  }}
                >
                  APY
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th>
              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  cursor: 'pointer'
                }}
                onClick={() => handleSort('profit')}
              >
                <Box
                  sx={{
                    fontWeight: sortKey === 'profit' ? 500 : 400
                  }}
                >
                  TOTAL PROFIT
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th></th>
          </tr>
        </thead>
        <tbody>
          {data.map((d: any) =>
            <tr key={d.address}>
              <td>
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Image
                    src={d.pie}
                    sx={{ width: 60 }}
                  />
                </Box>
              </td>
              <td>
                <Box sx={{ color: '#DF4886' }}>
                  ${numberWithCommas(d.tvl)}
                </Box>
              </td>
              <td>
                {numberWithCommas(d.staked)} TAKO
              </td>
              <td>
                {numberWithCommas(d.participants)}
              </td>
              <td>
                <Box sx={{ color: '#EFA906' }}>
                  {d.daily}%
                </Box>
              </td>
              <td>
                {d.apy}%
              </td>
              <td>
                ${numberWithCommas(d.profit)}
              </td>
              <td>
                <Button
                  variant="info"
                  sx={{
                    border: '1px solid #1799DE',
                    borderRadius: 40,
                    padding: '10px 20px',
                    cursor: 'pointer',
                    transition: 'all .2s',
                  }}
                >
                  DETAILS
                </Button>
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </Box>
  )
}

export default LotteryTable