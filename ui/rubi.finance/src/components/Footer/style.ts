import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  footerContainer: {
    // justifyContent: 'center',
    // alignItems: 'center',
    padding: '6% 25%',
    backgroundColor: '#000'

  },

  links: {
    color: '#fff',
    padding: '0px 30px',
    textDecoration: 'none',
    textTransform: 'uppercase',
    ':hover': {
      color: '#FFF',
    },

  }
}

export default styles