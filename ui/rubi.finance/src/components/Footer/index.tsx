import React, { useState, useEffect } from 'react'
import style from './style'
import { Flex, Link } from 'theme-ui';

const FooterSection: React.FC<any> = () => {
  return (
    <Flex sx={style.footerContainer}>
      <Link sx={style.links}>POOLS</Link>
      <Link sx={style.links}>View history</Link>
      <Link sx={style.links}>how it works</Link>
      <Link sx={style.links}>More</Link>
      <Link sx={style.links}>Collect Winnings</Link>
    </Flex>
  )
}

export default FooterSection