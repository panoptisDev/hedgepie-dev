export const styles = {
  mobile_menu_link: {
    display: 'block',
    width: '100%',
    '&:hover': {
      backgroundColor: '#0001',
    },
    '&:active': {
      backgroundColor: '#0002',
    },
    padding: '6px 24px',
    transition: 'all .2s',
  },
  header_inner_container: {
    margin: '0 auto',
    maxWidth: 1200,
    height: 120,
    display: 'flex',
    alignItems: 'center',
  },
  navbar_container: {
    fontWeight:"600",
    display: ['none', 'flex'],
    alignItems: 'center',
    fontSize:'18px'
  },
  connect_wallet_btn_container: {
    height: 64,
    display: 'flex',
    alignItems: 'center',
    padding:'-100px',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  mobile_menu_btn: {
    border: '1px solid #1799DE',
    color: '#1799DE',
    borderRadius: 4,
    cursor: 'pointer',
    transition: 'all .2s',
    display: ['flex', 'none'],
    width: 64,
    height: 64,
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#1799DE11',
    },
  },
  mobile_menu_connect_wallet: {
    alignItems: 'center',
    display:['flex','none'],
    cursor: 'pointer',
    color: '#1799DE',
    '&:hover': {
      backgroundColor: '#0001',
    },
    '&:active': {
      backgroundColor: '#0002',
    },
    width: '100%',
    padding: '6px 24px',
    transition: 'all .2s',
  },
}
