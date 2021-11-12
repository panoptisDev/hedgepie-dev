import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  },
  stepView: {

  },
  NftView: {
    padding: '5% 15%',
  },
  stakeSection: {
  },
  lotteriesContainer: {
    backgroundColor: '#000',
    padding: '5% 10%',
  },
  lotteriesTitle: {
    // padding: '10% 0%',
    textAlign: 'center',
    color: '#fff',
    fontSize: '40px'
  },
  stakeTitle: {
    color: '#7d7d7d',
    fontSize: '25px',
    textAlign: 'center',
    padding: '1% 0 3% 0'
  },
  roundsTitle: {
    paddingBottom: '3%',
    fontSize: '45px',
  },

  roundsContainer: {
    padding: '3% 10% 7% 10%',
    backgroundColor: '#fff'
    // paddingBottom: '10%',
    // paddingLeft: '10%'
  }
};

export default styles;
