import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    width: '25%',
    padding: '0px 50px 50px 50px'
  },
  flexContainer: {
    flexWrap: 'wrap',
  },
  titleText: {
    fontWeight: 'bold',
    padding: '20px 0px',
    textAlign: 'center',
    color: '#000',
    fontSize: '25px'

  },
  items: {
    color: '#65a765',
    fontWeight: 'bold',
    textAlign: 'center',
    backgroundColor: '#e6ffe6',
    padding: '40px 0px 10px 0px',
    textTransform: 'capitalize',
    fontSize: '15px',
    borderRadius: '5%',
  }
}

export default styles;