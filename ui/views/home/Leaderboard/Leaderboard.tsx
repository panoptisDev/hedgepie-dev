import React from 'react'
import { Box, Button, Card, Flex, Text } from 'theme-ui'
import { ChevronDown } from 'react-feather'
import TableHeadStaked from './TableHeadStaked'
import TableHeadSortable from './TableHeadSortable'
import TableRow from './TableRow'
import testData from './testData'

type Props = {}

const Leaderboard = (props: Props) => {

  const [checkList, setCheckList] = React.useState<any>([])

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

  return (
    <Box py={120} px={16}>
      <Box
        sx={{
          margin: '0 auto',
          width: 1200,
          minHeight: 500,
          padding: 48,
          background: 'linear-gradient(135deg, rgba(2,0,36,1) 0%, rgba(242,249,254,1) 0%, rgba(238,220,234,1) 100%)',
          borderRadius: 32
        }}
      >
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
        <Box mt={50}>
          <Box
            as="table"
            sx={{
              width: '100%',
              borderCollapse: 'separate',
              borderSpacing: '0 10px'
            }}
          >
            <thead>
              <Box
                as="tr"
                sx={{
                  '& th': {
                    height: 80,
                    paddingRight: 16,
                    fontSize: 14,
                    textAlign: 'left',
                    whiteSpace: 'nowrap',
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
                />
                <TableHeadSortable
                  label="TOTAL STAKED"
                />
                <TableHeadSortable
                  label="PARTICIPANTS"
                />
                <TableHeadSortable
                  label="DAILY"
                />
                <TableHeadSortable
                  label="PERFORMANCE FEE"
                />
                <TableHeadSortable
                  label="APY"
                />
                <TableHeadSortable
                  label="TOTAL PROFIT"
                />
              </Box>
            </thead>
            <tbody>
              {testData.map((d, i) =>
                <TableRow
                  key={i}
                  data={d}
                  onChange={checked => handleCheck(checked, d)}
                />
              )}
            </tbody>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Leaderboard