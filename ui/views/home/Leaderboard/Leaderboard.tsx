import React from 'react'
import { Box, Button, Spinner } from 'theme-ui'
import TableHeadStaked from './TableHeadStaked'
import TableHeadSortable from './TableHeadSortable'
import TableRow from './TableRow'
import testData from './testData'

function delay(time: number) {
  return new Promise(resolve => setTimeout(resolve, time))
}

const Leaderboard = () => {

  const [pies, setPies] = React.useState(testData)
  const [checkList, setCheckList] = React.useState<any>([])
  const [sortKey, setSortKey] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleCheck = (checked, value) => {
    if (checked) {
      setCheckList([
        ...checkList,
        value
      ])
    } else {
      setCheckList(checkList.filter(d => d.address !== value.address))
    }
  }

  const handleSort = (key) => {
    setSortKey(sortKey === key ? '' : key)
    setPies(pies)
  }

  const handleMore = async () => {
    setLoading(true)
    await delay(1000)
    setLoading(false)
  }

  const sorted = sortKey === '' ? pies : pies.slice().sort((a: any, b: any) => {
    if (a[sortKey] === b[sortKey]) return 0
    return a[sortKey] > b[sortKey] ? 1 : -1
  })

  return (
    <Box py={120} px={16}>
      <Box
        sx={{
          margin: '0 auto',
          width: 1200,
          minHeight: 500,
          backgroundColor: '#F6FAFD',
          borderRadius: 32,
          position: 'relative',
          overflow: 'hidden'
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            bottom: 0,
            right: 0,
            width: 800,
            height: 800,
            background: 'linear-gradient(135deg, rgba(0,0,0,0) 0%, rgba(0,0,0,0) 60%, rgba(235,203,228,1) 100%)',
          }}
        />

        <Box sx={{ position: 'relative' }} >
          <Box sx={{ padding: 48 }}>
            <Box
              sx={{
                color: '#16103A',
                fontSize: 50,
                fontWeight: 700,
              }}
            >
              Hedge Pie Leaderboard
            </Box>
            <Box
              sx={{
                fontSize: 18,
                fontWeight: 500,
                color: '#8E8DA0',
                marginTop: 26
              }}
            >
              YOU DESERVE THE BEST
            </Box>
          </Box>
          <Box
            sx={{
              overflow: 'auto',
              maxHeight: 800,
              padding: '0 48px'
            }}
          >
            <Box
              as="table"
              sx={{
                width: '100%',
                borderCollapse: 'separate',
                borderSpacing: '0 10px',
                position: 'relative'
              }}
            >
              <thead>
                <Box
                  as="tr"
                  sx={{
                    '& th': {
                      position: 'sticky',
                      top: 0,
                      height: 80,
                      paddingRight: 16,
                      fontSize: 14,
                      textAlign: 'left',
                      whiteSpace: 'nowrap',
                      backgroundColor: '#F6FAFD',
                      ':last-of-type': {
                        paddingRight: 0,
                        width: 30
                      }
                    }
                  }}
                >
                  <TableHeadStaked />
                  <th>HedgePies</th>
                  <TableHeadSortable
                    label="TVL"
                    active={sortKey === 'tvl'}
                    onClick={() => handleSort('tvl')}
                  />
                  <TableHeadSortable
                    label="TOTAL STAKED"
                    active={sortKey === 'totalStaked'}
                    onClick={() => handleSort('totalStaked')}
                  />
                  <TableHeadSortable
                    label="PARTICIPANTS"
                    active={sortKey === 'participants'}
                    onClick={() => handleSort('participants')}
                  />
                  <TableHeadSortable
                    label="DAILY"
                    active={sortKey === 'daily'}
                    onClick={() => handleSort('daily')}
                  />
                  <TableHeadSortable
                    label="PERFORMANCE FEE"
                    active={sortKey === 'performanceFee'}
                    onClick={() => handleSort('performanceFee')}
                  />
                  <TableHeadSortable
                    label="APY"
                    active={sortKey === 'apy'}
                    onClick={() => handleSort('apy')}
                  />
                  <TableHeadSortable
                    label="TOTAL PROFIT"
                    active={sortKey === 'totalProfit'}
                    onClick={() => handleSort('totalProfit')}
                  />
                </Box>
              </thead>
              <tbody>
                {sorted.map(d =>
                  <TableRow
                    key={d.address}
                    data={d}
                    onChange={checked => handleCheck(checked, d)}
                  />
                )}
              </tbody>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 200
            }}
          >
            {loading ?
              <Spinner />
              :

              <Button
                variant="info"
                sx={{
                  borderRadius: 40,
                  height: 64,
                  padding: '0 36px',
                  cursor: 'pointer',
                  transition: 'all .2s',
                  display: 'flex',
                  alignItems: 'center',
                  border: '1px solid #1799DE',
                }}
                onClick={handleMore}
              >
                View More
              </Button>
            }
          </Box>
        </Box>

      </Box>
    </Box>
  )
}

export default Leaderboard