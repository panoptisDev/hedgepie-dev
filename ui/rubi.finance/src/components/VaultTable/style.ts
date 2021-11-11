import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    paddingX: '1em',
  },
  topHeader: {
    padding: '1em 2em',
    borderTopRightRadius: '10px',
    borderTopLeftRadius: '10px',
    justifyContent: 'space-between'
  },
  searchLabel: {
    color: 'white',
    width: 'auto',
    display: 'block',
    minWidth: 'auto'
  },
  searchBox: {
    borderRadius: '20px',
    background: 'white',
    fontSize: '12px'
  },
  table: {
    textAlign: 'left',
    borderSpacing: '0 .5em',
    borderCollapse: 'separate',
    width: '100%'
  },
  tableHeadingCell: {
    ':first-of-type': {
      paddingLeft: '1em'
    },
  },
  tableHeading: {
    fontSize: '12px',
    color: 'black',
  },
  row: {
    ':nth-of-type(odd)': {
      '& > td': {
        backgroundColor: '#e6fff4',
        border: 'solid 1px #FFF',
        borderStyle: 'solid none solid none'
      }
    },
    ':nth-of-type(even)': {
      '& > td': {
        backgroundColor: '#FFF',
        border: 'solid 2px #e6fff4',
        borderStyle: 'solid none solid none'
      }
    }
  },
  cell: {
    height: '3em',

    '&&:first-of-type': {
      borderLeftStyle: 'solid',
      borderTopLeftRadius: '10px', 
      borderBottomLeftRadius: '10px',
      paddingLeft: '1em'
    },

    '&&:last-child': {
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
  topButton: {
    color: 'white',
    borderColor: 'white',
    fontSize: '12px'
  },
  rowButton: {
    color: 'white',
    background: 'black',
    fontSize: '12px',
    marginRight: '1em'
  },
  placeholder: {
    height: '2em',
    width: '2em',
    background: '#00be5a',
    borderRadius: '50%'
  },
  errorText: {
    color: 'black'
  }
};

export default styles;
