import React from 'react'
import { InjectedProps } from './types'
import { Box, Flex, ThemeUICSSObject } from 'theme-ui'
import { styles } from './styles'
import { IoClose } from 'react-icons/io5'

interface Props extends InjectedProps {
  title: string
  hideCloseButton?: boolean
  onBack?: () => void
  bodyPadding?: string
}

const Modal: React.FC<Props> = ({ children }) => (
  <Flex sx={styles.connect_wallet_modal as ThemeUICSSObject}>
    <Flex sx={styles.connect_wallet_modal_inner as ThemeUICSSObject}>
      {/* <Box sx={{ width: '100%', height: '3rem', display: 'flex', flexDirection: 'row', alignItems: 'center' }}>
        <IoClose style={{ marginLeft: 'auto' }} />
      </Box> */}
      {children}
    </Flex>
  </Flex>
)

export default Modal
