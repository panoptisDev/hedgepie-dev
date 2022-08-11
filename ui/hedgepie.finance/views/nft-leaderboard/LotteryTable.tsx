import React from 'react'
import { Box, Button, Image, ThemeUICSSObject } from 'theme-ui'
import { ChevronDown } from 'react-feather'

import { styles } from './styles'
import { TokenInfo } from './LeaderBoard'
import { useRouter } from 'next/router'

function numberWithCommas(x: number) {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

const LotteryTable = ({ data, onSort, sortKey }: any) => {
  const router = useRouter()
  const handleSort = (sortType: string) => {
    onSort(sortType)
  }

  return (
    <Box sx={styles.lottery_table as ThemeUICSSObject}>
      <table
        style={{
          width: '100%',
          borderSpacing: 0,
        }}
      >
        <thead
          style={{
            borderRadius: '16px',
            color: 'white',
            height: '80px',
          }}
        >
          <tr
            style={{
              backgroundColor: '#64BBE9',
              borderRadius: '100px',
            }}
          >
            <th
              style={{
                width: 100,
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTopLeftRadius: '20px',
              }}
            >
              HedgePies
            </th>
            <th
              style={{
                width: 100,
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              Name
            </th>
            <th
              style={{
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              <Box sx={styles.lottery_table_sortable as ThemeUICSSObject} onClick={() => handleSort('tvl')}>
                <Box
                  sx={{
                    fontWeight: sortKey === 'tvl' ? 600 : 400,
                    fontSize: '14px',
                  }}
                >
                  TVL
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th
              style={{
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              TOTAL STAKED
            </th>
            <th
              style={{
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              # OF PARTICIPANTS
            </th>
            <th
              style={{
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              DAILY
            </th>
            <th
              style={{
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              <Box sx={styles.lottery_table_sortable as ThemeUICSSObject} onClick={() => handleSort('apy')}>
                <Box
                  sx={{
                    fontWeight: sortKey === 'apy' ? 600 : 400,
                    fontSize: '14px',
                  }}
                >
                  APY
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th
              style={{
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
              }}
            >
              <Box sx={styles.lottery_table_sortable as ThemeUICSSObject} onClick={() => handleSort('profit')}>
                <Box
                  sx={{
                    fontWeight: sortKey === 'profit' ? 600 : 500,
                    fontSize: '14px',
                  }}
                >
                  TOTAL PROFIT
                </Box>
                <ChevronDown size={16} />
              </Box>
            </th>
            <th
              style={{
                fontSize: '14px',
                fontWeight: '600',
                borderBottom:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTop:
                  '10px solid linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)',
                borderTopRightRadius: '20px',
              }}
            ></th>
          </tr>
        </thead>
        <tbody>
          {data.map((d: TokenInfo, i: number) => (
            <tr key={d.tokenId} style={{ backgroundColor: 'white' }}>
              <td style={{}}>
                <Box sx={{ width: '100%', textAlign: 'center' }}>
                  <Image src={d.imageURL} sx={{ width: 60, boxShadow: '#ccc 0px 3px 3px 2px' }} />
                </Box>
              </td>
              <td style={{}}>
                <Box sx={{ color: '#DF4886', fontSize: '16px', fontWeight: '600' }}>{d.name}</Box>
              </td>
              <td style={{}}>
                {/* <Box sx={{ color: '#DF4886' }}>$numberWithCommas(d.tvl)</Box> */}
                <Box sx={{ color: '#DF4886', fontSize: '16px', fontWeight: '600' }}>{'$100,000 USD'}</Box>
              </td>
              {/* <td>{numberWithCommas(d.staked)} TAKO</td> */}
              {/* <td>{numberWithCommas(d.participants)}</td> */}
              <td
                style={{
                  color: '#3B3969',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                {'$100,000 BNB'}
              </td>
              <td
                style={{
                  color: '#3B3969',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                {'24'}
              </td>
              <td style={{}}>
                {/* <Box sx={{ color: '#EFA906' }}>d.daily%</Box> */}
                <Box
                  sx={{
                    color: '#EFA906',
                    fontSize: '16px',
                    fontWeight: '600',
                  }}
                >
                  10%
                </Box>
              </td>
              {/* <td>d.apy%</td> */}
              <td
                style={{
                  color: '#3B3969',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                112%
              </td>
              {/* <td>$numberWithCommas(d.profit)</td> */}
              <td
                style={{
                  color: '#3B3969',
                  fontSize: '16px',
                  fontWeight: '600',
                }}
              >
                $430,000 USD
              </td>
              <td style={{}}>
                <Button
                  variant="info"
                  sx={styles.lottery_table_details_btn as ThemeUICSSObject}
                  onClick={() => router.push('/view-contents?tokenId=' + d.tokenId)}
                >
                  DETAILS
                </Button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </Box>
  )
}

export default LotteryTable
