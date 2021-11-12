import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  section: {
    overflow: 'hidden',
    backgroundColor: '#333',
    position: 'fixed',
    top: '0',
    width: '100%',
    zIndex: '1',
  },
  container: {
    backgroundColor: '#000',
    padding: '10px 25%',
  },
  flexContainer: {
    columnGap: '.5em',
    backgroundColor: '#fff',
    justifyContent: 'space-between',
    margin: '0px',
    alignItems: 'center',
    padding: '0px 10%',
  },
  darkButton: {
    marginY: '2em',
    marginX: '2%',
    paddingY: '1em',
    paddingX: '4%',
    borderRadius: '40px',
    fontSize: '10px',
    background: '#fff',
    color: '#000',
    border: '1px solid #000',
  },
  link: {
    flexBasis: '25%',
    textTransform: 'uppercase',
    color: 'white',
    textDecoration: 'none',
    ':hover': {
      color: '#FFF',
    },
  },
};

export default styles;
