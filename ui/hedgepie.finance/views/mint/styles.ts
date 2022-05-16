export const styles = {
  mint_page_container: {
    position: 'relative',
  },
  mint_title_mast_container: {
    width: '100%',
    position: 'absolute',
    top: -99,
    left: 0,
    [`@media screen and (min-width: 700px)`]: {
      top: -149,
    },
    [`@media screen and (min-width: 992px)`]: {
      top: -197,
    },
  },
  mint_title_mast_image_container: {
    maxWidth: 1200,
    margin: '0 auto',
  },
  mint_title_mast_hedgehog_img: {
    width: 200,
    [`@media screen and (min-width: 700px)`]: {
      width: 300,
    },
    [`@media screen and (min-width: 992px)`]: {
      width: 'auto',
    },
  },
  mint_wizard_outer_container: {
    position: 'relative',
    padding: '0 16px',
    paddingTop: 80,
    paddingBottom: 40,
    overflow: 'hidden',
  },
  mint_wizard_inner_container: {
    margin: '0 auto',
    maxWidth: 1200,
  },
  mint_eaten_pie_img_outer_container: {
    margin: '0 auto',
    maxWidth: 1200,
  },
  mint_eaten_pie_img_inner_container: { maxWidth: 1200, margin: '0 auto', position: 'relative' },
  mint_eaten_pie_img: {
    position: 'absolute',
    width: 200,
    top: -40,
    right: 0,
    [`@media screen and (min-width: 600px)`]: {
      width: 300,
      right: -40,
    },
    [`@media screen and (min-width: 1200px)`]: {
      width: 400,
      right: -200,
    },
  },
  mint_flow_outer_container: {
    borderRadius: 8,
    overflow: 'hidden',
    boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
  },
  ybnft_mint_title_box: {
    display: 'flex',
    alignItems: 'center',
    height: 60,
    padding: '0 16px',
    fontSize: 16,
    backgroundColor: '#1799DE',
    color: '#fff',
    [`@media screen and (min-width: 800px)`]: {
      height: 120,
      fontSize: 32,
      padding: '0 46px',
    },
  },
  mint_wizard_nav_container: {
    padding: 20,
    [`@media screen and (min-width: 800px)`]: {
      padding: 40,
    },
  },
  mint_wizard_horizontal_nav: {
    display: 'none',
    [`@media screen and (min-width: 800px)`]: {
      display: 'block',
    },
  },
  mint_wizard_vertical_nav: {
    display: 'block',
    [`@media screen and (min-width: 800px)`]: {
      display: 'none',
    },
  },
  mint_nav_vertical_line: {
    marginLeft: 20,
    height: 15,
    width: '1px',
    backgroundColor: '#1799DE',
  },
  mint_nav_vertical_item_container: {
    display: 'flex',
    alignItems: 'center',
  },
  mint_nav_vertical_item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 40,
    height: 40,
    border: '1px solid #1799DE',
    borderRadius: '50%',
    fontWeight: 900,
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'all .2s',
    flexShrink: 0,
    '&:hover': {
      backgroundColor: '#1799DE11',
    },
    '&:active': {
      backgroundColor: '#1799DE33',
    },
  },
  mint_nav_vertical_label: {
    marginLeft: 3,
    fontSize: 12,
    [`@media screen and (min-width: 400px)`]: {
      fontSize: 16,
    },
  },
  mint_nav_horizontal_container: {
    display: 'flex',
    alignItems: 'center',
    marginTop: 50,
  },
  mint_nav_horizontal_line: {
    height: '1px',
    width: 160,
    backgroundColor: '#1799DE',
  },
  mint_nav_horizontal_item: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 74,
    height: 74,
    border: '1px solid #1799DE',
    borderRadius: '50%',
    fontSize: 36,
    fontWeight: 900,
    userSelect: 'none',
    cursor: 'pointer',
    transition: 'all .2s',
    '&:hover': {
      backgroundColor: '#1799DE11',
    },
    '&:active': {
      backgroundColor: '#1799DE33',
    },
  },
  mint_nav_horizontal_label: {
    position: 'absolute',
    top: -50,
    left: 30,
    display: 'flex',
    justifyContent: 'center',
    width: 0,
    whiteSpace: 'nowrap',
  },
}
