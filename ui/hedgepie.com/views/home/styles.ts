export const styles = {
  banner_container: {
    marginTop:-120,
    height: 1000,
    marginBottom: 60,
    background: 'url(/images/home-banner.jpg)',
    backgroundPosition: 'center bottom',
    backgroundSize: 'cover',
    overflow: 'hidden',
  },
  banner_box: {
    paddingTop: [200, 200, 200, 250],
  },
  banner_contents_container: {
    margin: '0 auto',
    maxWidth: 1200,
    position: '',
    display:'flex',
    flexDirection:['column','column','row'],
    gap:'10px'
  },
  banner_coins_image: {
    top: [300, 300, 250, -140],
    right: [-40, 0, 40, 0],
    width: [250, 250, 300, 800],
  },
  banner_pie_image: {
    top: [400, 400, 350, 0],
    right: [0, 30],
    width: [800, 540, 400, 540],
    paddingLeft:"20px"
  },
  banner_title: {
    maxWidth: [260, 450, 450, 562],
    fontSize: [50, 80, 80, 100],
    fontWeight: 700,
    color: '#16103a',
    lineHeight: 1,
    paddingRight:"20px",
    marginLeft:'-5px'
  },
  banner_text: {
    marginTop: [4, 5],
    fontSize: [16, 24],
    fontWeight: 600,
    color: '#0B4C6F',
    maxWidth: 665,
  },
  banner_connect_wallet_wrapper: {
    borderRadius: 40,
    height: [50,50,64],
    width:'fit-content',
    padding: ['0 20px','0 20px','0 24px'],
    cursor: 'pointer',
    transition: 'all .2s',
    display: 'flex',
    alignItems: 'center',
  },
}
