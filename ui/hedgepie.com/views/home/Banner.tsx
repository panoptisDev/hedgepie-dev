import React from 'react'
import { Box, Image, Button, ThemeUICSSObject } from 'theme-ui'
import { ArrowRight } from 'react-feather'

import { styles } from './styles'
import Link from 'next/link'
import toast from 'utils/toast'

type Props = {}

const Banner = (props: Props) => {
  return (
    <Box px={3} sx={styles.banner_container as ThemeUICSSObject}>
      <Box sx={styles.banner_box as ThemeUICSSObject}>
        <Box sx={styles.banner_contents_container as ThemeUICSSObject}>
          <Box sx={{ position: 'relative', display: 'flex', flexDirection: 'column', gap: '0px' }}>
            <Box sx={styles.banner_title as ThemeUICSSObject}>Access DeFi without the hassle</Box>
            <Box sx={styles.banner_text as ThemeUICSSObject}>
              Get access to a curated list of proven profitable investment pools and strategies created by crypto
              investment experts and save time, making your investment decisions faster.
            </Box>
            <Box sx={{ marginTop: [30, 70] }}>
              <Button variant="primary" sx={styles.banner_connect_wallet_wrapper as ThemeUICSSObject}>
                <a href="https://hedgepie.finance" target="_blank">
                  <Box mr={2}>
                    <Box sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
                      <Box mr={2} sx={{ fontWeight: '500', letterSpacing: '2px', fontSize: [14, 14, 20] }}>
                        Start Investing
                      </Box>
                      {/* <ArrowRight /> */}
                    </Box>
                  </Box>
                </a>
              </Button>
            </Box>
          </Box>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              alignItems: 'center',
              justifyContent: 'center',
              marginTop: '0px',
            }}
          >
            <Box
              sx={{
                width: ['100%', '100%', '50%'],
                height: '30rem',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
                position: 'absolute',
              }}
            >
              <Image src="/images/pie.png" sx={styles.banner_pie_image as ThemeUICSSObject} />
            </Box>
            <Box
              sx={{
                width: ['100%', '100%', '50%'],
                height: '30rem',
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                alignItems: 'center',
              }}
            >
              <Image src="/images/homepage-coins.png" sx={styles.banner_coins_image as ThemeUICSSObject} />
            </Box>
          </Box>
        </Box>
      </Box>
    </Box>
  )
}

export default Banner
