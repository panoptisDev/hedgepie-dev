import React, { useState, useEffect } from 'react'
import style from './style'
import { NavLinks } from './types'
import { Button, Container, Link, Card, Box, Flex, MenuButton } from 'theme-ui';

const HeaderSection: React.FC<any> = () => {

  const navLink: NavLinks[] = [
    {
      name: 'Vaults',
      link: 'vaults'
    },
    {
      name: 'View History',
      link: 'history'
    },
    {
      name: 'How IT Works',
      link: 'how-it-works'
    },
    {
      name: 'My Collections',
      link: 'my-collections'
    },
    {
      name: 'MORE',
      link: 'more'
    }
  ]
  return (
    <section sx={style.section} >
      <Container sx={style.container}>
        <Flex>
          {navLink.map(item => {
            return <Link sx={style.link} href={item.link}>{item.name}</Link>
          })}
        </Flex>
      </Container>
      <Flex sx={style.flexContainer}>
        <Container sx={{ width: '0px', margin: '0px' }}>
          <MenuButton aria-label="Toggle Menu" />
        </Container>
        <Container sx={{ width: '100%', margin: '0px', display: 'flex', justifyContent: 'flex-end' }}>
          <Button sx={{
            marginY: '2em',
            marginX: '2%',
            paddingY: '1em',
            paddingX: '5%',
            borderRadius: '40px',
            fontSize: '10px'
          }}>CONNECT WALLET</Button>

          <Button sx={style.darkButton}>Login</Button>
        </Container>
      </Flex>
    </section>
  )
}

export default HeaderSection