import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    paddingX: '1em',
  },
  table: {
    textAlign: 'left',
    borderSpacing: '0 .5em',
    borderCollapse: 'separate'
  },
  tableHeadingCell: {
    ':first-child': {
      paddingLeft: '5em'
    },
  },
  tableHeading: {
    fontSize: '12px',
    color: 'black',
  },
  row: {
    
  },
  cell: {
    backgroundColor: '#e6fff4',
    border: 'solid 1px #FFF',
    borderStyle: 'solid none',
    height: '5em',

    ':first-of-type': {
      borderLeftStyle: 'solid',
      borderTopLeftRadius: '10px', 
      borderBottomLeftRadius: '10px',
      paddingLeft: '5em'
    },

    ':last-child': {
      borderRightStyle: 'solid',
      borderBottomRightRadius: '10px', 
      borderTopRightRadius: '10px'
    }
  },
  buttonCell: {
    height: '100%',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  buttonContainer: {
    background: '#6551da',
    height: '100%',
    alignItems: 'center',
    borderRadius: '10px',
    columnGap: '1em',
    paddingX: '1em'
  },
  leftButton: {
    color: 'white',
    borderColor: 'white',
    fontSize: '12px'
  },
  rightButton: {
    color: 'black',
    background: 'white',
    fontSize: '12px'
  },
  ctaButton: {
    marginY: '2em',
    paddingY: '1em',
    paddingX: '5%',
    borderRadius: '40px',
    fontSize: '14px'
  }
};

export default styles;
