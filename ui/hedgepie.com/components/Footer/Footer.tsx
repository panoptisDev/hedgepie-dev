import React from 'react'
import Link from 'next/link'
import { theme } from 'themes/theme'
import { Box, Flex, Text, ThemeProvider, Image, Link as ThemeLink, Divider, ThemeUICSSObject } from 'theme-ui'
import SocialButton from './SocialButton'

import { styles } from './styles'

type Props = {}

const Footer = (props: Props) => {
  return (
    <Box className="footer" sx={styles.footer_container as ThemeUICSSObject}>
      <Box py={90} px={[16, 60]} sx={styles.footer_inner_container as ThemeUICSSObject}>
        <Box mr={4}>
          <Image src="images/logo.png" />
          <Box sx={styles.footer_text_container as ThemeUICSSObject}>
            Hedgepie is a community-driven decentralized network of investors and crypto enthusiasts from all over the
            world. Stay on top of the action with the latest news and important announcements on our social media
            channels.
          </Box>
          <Box sx={styles.footer_social_btns_container as ThemeUICSSObject}>
            <SocialButton>
              <Image src="images/fb.png" />
            </SocialButton>
            <SocialButton>
              <a href="https://twitter.com/Hedgepiefinance" target="_blank">
                <Image src="images/twitter.png" />
              </a>
            </SocialButton>
            <SocialButton>
              <Image src="images/linkedin.png" />
            </SocialButton>
          </Box>
        </Box>
        <Box
          mt={[5, 0]}
          sx={{
            width: 200,
          }}
        >
          <Box sx={{}}>HedgePie</Box>
          <Box mt={54} sx={styles.footer_navbar as ThemeUICSSObject}>
            {/* <Link href="/vault" passHref>
              <ThemeLink>Vault</ThemeLink>
            </Link> */}
            <a target="_blank" href="/HedgePie-Whitepaper-V5.pdf">
              <ThemeLink>White Paper</ThemeLink>
            </a>
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                document?.getElementById('demo-info')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
            >
              <ThemeLink>Leaderboard</ThemeLink>
            </div>
            {/* <Link href="/details" passHref>
              <ThemeLink>Finished Lotteries</ThemeLink>
            </Link>
            <Link href="/" passHref>
              <ThemeLink>Current Lottery</ThemeLink>
            </Link> */}
            <div
              style={{ cursor: 'pointer' }}
              onClick={() => {
                document?.getElementById('collect-winnings')?.scrollIntoView({
                  behavior: 'smooth',
                })
              }}
            >
              <ThemeLink>Mint</ThemeLink>
            </div>
          </Box>
        </Box>
      </Box>
      <Divider
        sx={{
          backgroundColor: '#C6D6E2',
          opacity: 0.2,
        }}
      />
      <Box py={30} px={[16, 60]} sx={styles.footer_company_container as ThemeUICSSObject}>
        <Box>&copy; 2022 HedgePie</Box>
        <Flex
          sx={{
            flexDirection: ['row', 'row', 'row'],
            gap: [12, 24],
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          }}
        >
          <Link href="/" passHref>
            <ThemeLink>Privacy policy</ThemeLink>
          </Link>
          <Link href="/" passHref>
            <ThemeLink>Terms &amp; Conditions</ThemeLink>
          </Link>
        </Flex>
      </Box>
    </Box>
  )
}

export default Footer
