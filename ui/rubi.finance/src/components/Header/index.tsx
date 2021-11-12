import React, { useState, useEffect } from 'react'
import style from './style'
import { Button, Container, Link, Card, Box, Flex, MenuButton } from 'theme-ui';

const HeaderSection: React.FC<any> = () => {
  return (
    <section sx={style.section} >
      <Container sx={style.container}>
        <Flex>
          <Link sx={style.link} href="#!">Vaults</Link>
          <Link sx={style.link} href="#!">View History</Link>
          <Link sx={style.link} href="#!">How IT Works</Link>
          <Link sx={style.link} href="#!">My Collections</Link>
          <Link sx={style.link} href="#!">More</Link>
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