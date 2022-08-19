export const styles = {
  mobile_menu_link: {
    display: 'block',
    width: '100%',
    padding: '6px 24px',
    transition: 'all .2s',
    '&:hover': {
      backgroundColor: '#0001',
    },
    '&:active': {
      backgroundColor: '#0002',
    },
  },
  header_inner_container: {
    margin: '0 auto',
    maxWidth: 1200,
    height: 120,
    display: 'flex',
    alignItems: 'center',
  },
  navbar_container: {
    display: ['none', 'flex'],
    alignItems: 'center',
  },
  connect_wallet_btn_container: {
    height: 64,
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
    padding:'-100px'
  },
  mobile_menu_btn: {
    border: '1px solid #1799DE',
    color: '#1799DE',
    borderRadius: 4,
    width: 64,
    height: 64,
    cursor: 'pointer',
    transition: 'all .2s',
    display: ['flex', 'none'],
    alignItems: 'center',
    justifyContent: 'center',
    '&:hover': {
      backgroundColor: '#1799DE11',
    },
  },
  mobile_menu_connect_wallet: {
    alignItems: 'center',
    width: '100%',
    padding: '6px 24px',
    transition: 'all .2s',
    display:['flex','none'],
    cursor: 'pointer',
    color: '#1799DE',
    '&:hover': {
      backgroundColor: '#0001',
    },
    '&:active': {
      backgroundColor: '#0002',
    },
  },
}
