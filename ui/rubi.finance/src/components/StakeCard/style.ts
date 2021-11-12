import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  left: {
    backgroundColor: '#c8ffff',
    padding: '15% 20%',
    color: '#000'
  },
  right: {
    backgroundColor: '#6161f5',
    color: '#fff',
    padding: '15% 90px',
    paddingRight: '20%'
  },
  leftHeadingTitle: {
    color: '#000',
    fontSize: '50px',
  },
  rightHeadingTitle: {
    color: '#fff',
    fontSize: '50px',
  },
  headingTitle: {
    color: '#000',
    fontSize: '40px',
  },
  headingContent: {
    lineHeight: '30px',
    fontSize: '20px',
    paddingBottom: '40px'
    // fontWeight: 'bold',
  },
  darkButton: {
    background: '#000',
  },
  whiteButton: {
    background: '#6161f5',
    color: '#fff',
    border: '1px solid #fff'
  }
}

export default styles