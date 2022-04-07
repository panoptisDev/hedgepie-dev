import React from 'react'
import { InjectedProps } from './types'
import { Flex, ThemeUICSSObject } from 'theme-ui'
import { styles } from './styles'

interface Props extends InjectedProps {
  title: string
  hideCloseButton?: boolean
  onBack?: () => void
  bodyPadding?: string
}

const Modal: React.FC<Props> = ({ children }) => (
  <Flex sx={styles.connect_wallet_modal as ThemeUICSSObject}>
    <Flex sx={styles.connect_wallet_modal_inner as ThemeUICSSObject}>{children}</Flex>
  </Flex>
)

export default Modal
