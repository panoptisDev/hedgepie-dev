import { Flex, Button, Text, ThemeUICSSObject } from 'theme-ui'

import { styles } from './styles'

const Summary = (props) => {
  var { allocated, chosenFileName, YBNFTName } = props
  return (
    <Flex sx={styles.summary_outer_container as ThemeUICSSObject}>
      <Flex sx={styles.summary_container as ThemeUICSSObject}>
        <Text sx={styles.summary_title as ThemeUICSSObject}>YB NFT Summary</Text>
        {/* Pie Chart */}
        <Flex sx={styles.piechart_container as ThemeUICSSObject}>
          <Flex sx={styles.piechart_outer as ThemeUICSSObject}>
            <Flex sx={styles.piechart_inner as ThemeUICSSObject}>
              <Flex
                sx={
                  {
                    ...styles.piechart_allocated,
                    background: `conic-gradient(#A11D2B 0.00% ${allocated}%,#C92144 ${allocated}%)`,
                  } as ThemeUICSSObject
                }
              ></Flex>
            </Flex>
          </Flex>
        </Flex>
        <Flex sx={styles.summary_details_container as ThemeUICSSObject}>
          <Flex sx={styles.summary_details_inner_flex as ThemeUICSSObject}>
            <Text sx={styles.summary_details_inner_value as ThemeUICSSObject}>{allocated}%</Text>
            <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>Allocated</Text>
          </Flex>
          <Flex sx={styles.summary_details_inner_flex as ThemeUICSSObject}>
            <Text sx={styles.summary_details_inner_value as ThemeUICSSObject}>{100 - allocated}%</Text>
            <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>Unallocated</Text>
          </Flex>
          <Flex sx={styles.summary_details_inner_flex as ThemeUICSSObject}>
            <Text sx={styles.summary_details_inner_value as ThemeUICSSObject}>Artwork</Text>
            {chosenFileName ? (
              <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>{chosenFileName}</Text>
            ) : (
              <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>Not Set</Text>
            )}
          </Flex>
          <Flex sx={styles.summary_details_inner_flex as ThemeUICSSObject}>
            <Text sx={styles.summary_details_inner_value as ThemeUICSSObject}>YB NFT Name</Text>
            {YBNFTName ? (
              <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>{YBNFTName}</Text>
            ) : (
              <Text sx={styles.summary_details_inner_title as ThemeUICSSObject}>Not Set</Text>
            )}
          </Flex>
        </Flex>
      </Flex>
    </Flex>
  )
}

export default Summary
