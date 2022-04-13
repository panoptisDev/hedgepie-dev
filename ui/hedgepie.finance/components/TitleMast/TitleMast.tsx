import React from 'react'
import { Box, Image } from 'theme-ui'

type Props = { title: string }

const TitleMast = (props: Props) => {
  const { title } = props
  return (
    <Box
      sx={{
        position: 'relative',
        height: 200,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 16,
      }}
    >
      <Image
        src="/images/leaderboard-header.png"
        sx={{
          position: 'absolute',
          top: 0,
          left: 0,
          width: '100%',
          height: '100%',
          objectFit: 'cover',
          objectPosition: 'right',
        }}
      />
      <Box
        sx={{
          fontSize: 40,
          fontWeight: 'bold',
          textAlign: 'center',
        }}
        id="title-mast"
      >
        {title}
      </Box>
    </Box>
  )
}

export default TitleMast
