import React, { useState, useEffect } from 'react'
import style from './style'
import { NavLinks } from './types'
import { Flex, Link, Heading } from 'theme-ui';

const FooterSection: React.FC<any> = () => {
  const navLink: NavLinks[] = [
    {
      name: 'Pools',
      link: 'pools'
    },
    {
      name: 'View History',
      link: 'view-history'
    },
    {
      name: 'How IT Works',
      link: 'how-it-works'
    },
    {
      name: 'MORE',
      link: 'more'
    },
    {
      name: 'My Collections',
      link: 'my-collections'
    },
  ]

  return (
    <Flex sx={style.footerContainer}>
      {navLink.map(item => {
        return <Link sx={style.links} href={item.link}>
          <Heading sx={style.linkTitle}>{item.name}</Heading>
        </Link>
      })}
    </Flex>
  )
}

export default FooterSection