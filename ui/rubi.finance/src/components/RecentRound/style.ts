import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    paddingBottom: '2em'
  },
  borderClip: {
    paddingX: '1.5em',
    paddingY: '.5em',
    background: '#6551da',
    color: 'white',
    borderTopLeftRadius: '10px',
    borderBottomRightRadius: '10px'
  },
  title: {
    alignSelf: 'center',
    paddingLeft: '2em',
    fontSize: '.7em'
  },
  row: {
    paddingX: '1em',
    paddingY: '.5em',
    alignItems: 'center',
  },
  titleBox: {
    flexBasis: '40%',
    columnGap: '.5em',
    alignItems: 'center'
  },
  rowTitle: {
    color: 'black',
    fontSize: '1em',
    fontWeight: 600
  },
  viewBox: {
    flexBasis: '60%',
    background: '#e6fff4',
    borderRadius: '5px',
    alignItems: 'center',
    justifyContent: 'center',
    height: '3em'
  },
  box1Text: {
    fontSize: '2.5em',
    fontWeight: 700,
    color: '#00be5a'
  },
  box2Text: {
    fontSize: '2em',
    fontWeight: 700,
    color: '#00be5a'
  },
  box3Text: {
    fontSize: '1.5em',
    fontWeight: 700,
    color: '#00be5a'
  }
};

export default styles;
