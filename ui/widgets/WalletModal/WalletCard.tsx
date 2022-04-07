import React from 'react'
import { connectorLocalStorageKey } from './config'
import { Login, Config } from './types'
import { Button, Flex, Text, Image, ThemeUICSSObject } from 'theme-ui'
import { styles } from './styles'

interface Props {
  walletConfig: Config
  login: Login
  onDismiss: () => void
  mb: string
}

const WalletCard: React.FC<Props> = ({ login, walletConfig, onDismiss, mb }) => {
  const { title, icon, bgColor } = walletConfig

  return (
    <Button
      type="button"
      onClick={() => {
        if (title === 'More') {
          return
        }
        login(walletConfig.connectorId)
        window.localStorage.setItem(connectorLocalStorageKey, walletConfig.connectorId)
        onDismiss()
      }}
      sx={{
        borderRadius: '30px',
        backgroundColor: bgColor,
        cursor: 'pointer',
        width: '100%',
        [`@media screen and (min-width: 650px)`]: {
          width: 200,
          margin: 2,
        }
      }}
      id={`wallet-connect-${title.toLocaleLowerCase()}`}
    >
      <Flex sx={styles.flex_wallet_card as ThemeUICSSObject}>
        <Image src={icon} sx={styles.icon_wallet_card as ThemeUICSSObject} />
        <Text sx={styles.wallet_card_text as ThemeUICSSObject}>{title}</Text>
      </Flex>
    </Button>
  )
}

export default WalletCard
