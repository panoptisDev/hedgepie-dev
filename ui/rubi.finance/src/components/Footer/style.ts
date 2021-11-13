import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  footerContainer: {
    justifyContent: 'center',
    paddingY: '6%',
    backgroundColor: '#000',
    columnGap: '2em'
  },
  links: {
    textDecoration: 'none'
  },
  linkTitle: {
    fontSize: '.8em',
    fontWeight: 500,
    textTransform: 'uppercase',
    color: 'white',
    ':hover': {
      color: '#FFF',
    },
  }
}

export default styles