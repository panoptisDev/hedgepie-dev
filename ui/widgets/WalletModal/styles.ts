export const styles = {
  flex_wallet_card: {
    gap: 24,
    padding: '16px',
    alignItems: 'center',
    // height: '155px',
    flexShrink: 0,
    textAlign: 'left',
    [`@media screen and (min-width: 650px)`]: {
      height: '155px',
      flexDirection: 'column',
      justifyContent: 'center',
      gap: 16,
      padding: '16px 0',
      textAlign: 'center',
    }
  },
  icon_wallet_card: {
    width: 40,
    height: 40,
    flexShrink: 0,
    [`@media screen and (min-width: 650px)`]: {
      width: 60,
      height: 60,
    }
  },
  wallet_card_text: {
    fontFamily: 'Poppins',
    fontWeight: '600',
    color: '#16103A',
    [`@media screen and (min-width: 650px)`]: {
      fontSize: 20
    }
  },
}
