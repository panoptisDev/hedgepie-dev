import React from 'react'

import { Box, Link } from 'theme-ui'

const SocialButton = ({ href = '#', children, ...props }) => (
  <Link
    href={href}
  >
    <Box
      sx={{
        width: 36,
        height: 36,
        backgroundColor: '#fff',
        borderRadius: '50%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        cursor: 'pointer',
        userSelect: 'none',
        transition: 'all .2s',
        '&:hover': {
          opacity: .9
        },
        '&:active': {
          opacity: 1
        }
      }}
      {...props}
    >
      {children}
    </Box>
  </Link>
)

export default SocialButton
