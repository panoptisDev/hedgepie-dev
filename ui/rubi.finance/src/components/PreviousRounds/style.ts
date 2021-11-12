import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    border: '2px solid black',
    borderRadius: '5px',
  },
  title: {
    color: 'white',
    paddingLeft: '1.5em',
    paddingY: '.4em',
    fontSize: '.7em',
    fontWeight: '500'
  },
  list: {
    listStyleType: 'none',
    padding: 0,
    margin: 0
  },
  listItem: {
    borderBottom: '1px solid black',
    display: 'flex',
    justifyContent: 'space-between',
    padding: '.5em 1em',

    ':last-of-type': {
      borderBottom: 'none'
    }
  },
  rowText: {
    fontSize: '.7em',
    color: 'black'
  },
  caret: {
    fontSize: '.7em'
  },
  cta: {
    alignItems: 'center',
    justifyContent: 'center',
    columnGap: '.5em',
    marginTop: '1em'
  },
  ctaText: {
    color: 'black',
    fontSize: '.7em',
    fontWeight: '500'
  },
};

export default styles;
