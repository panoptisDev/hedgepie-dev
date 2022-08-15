export const styles = {
  leaderboard_container: {
    padding: '100px 16px',
    display: 'flex',
    justifyContent: 'center',
    marginTop:'-100px',
  },
  leaderboard_inner_container: {
    width: '100%',
    maxWidth: 1300,
    borderRadius: 8,
    boxShadow: 'rgba(100, 100, 111, 0.2) 0px 7px 29px 0px',
    background:'linear-gradient(137.62deg, rgba(252, 143, 143, 0.1) 0.17%, rgba(143, 143, 252, 0.3) 110.51%)'
  },
  lottery_load_container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: 200,
  },
  lottery_load_more_btn: {
    border: '1px solid #1799DE',
    borderRadius: 40,
    padding: '18px 54px',
    cursor: 'pointer',
    transition: 'all .2s',
  },
  lottery_search_container: {
    bg: 'details',
    padding: [12, 30],
    display: 'flex',
    flexDirection: ['column-reverse', 'row'],
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  lottery_search_input: {
    maxWidth: 300,
    height: 60,
    backgroundColor: '#fff',
    border: 'none',
    outline: 'none',
    borderRadius: 30,
    paddingLeft: 24,
    paddingRight: 24,
    fontSize: 14,
    marginTop: [12, 0],
    marginLeft:'auto'
  },
  lottery_search_finished_rounds: {
    fontSize: 24,
    color: '#fff',
  },
  lottery_table: {
    overflow: 'auto',
    borderRadius:'8px',
    backgroundcolor:'#fff',
    '& th': {
      textAlign: 'left',
      padding: 20,
      fontSize: 14,
      fontWeight: 400,
      whiteSpace: 'nowrap',
    },
    '& td': {
      textAlign: 'left',
      padding: 20,
      fontSize: 14,
      whiteSpace: 'nowrap',
    },
    '& tbody td': {
      color: '#8E8DA0',
    },
    '& tbody tr:nth-of-type(odd)': {
      backgroundColor: '#E5F6FF',
    },
  },
  lottery_table_sortable: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    cursor: 'pointer',
  },
  lottery_table_details_btn: {
    border: '3px solid #1799DE',
    borderRadius: 40,
    padding: '10px 20px',
    cursor: 'pointer',
    transition: 'all .2s',
    color:"#14114B",
    fontWeight:"600",
    fontSize:"14px"
  },
}
