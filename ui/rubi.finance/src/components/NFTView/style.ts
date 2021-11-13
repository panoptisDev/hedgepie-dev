import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  container: {
    padding: 0
  },
  headerSection: {
    background: '#685BC7',
    width: '100%',
    borderTopLeftRadius: '0.375rem',
    borderTopRightRadius: '0.375rem',
    textAlign: 'center',
    paddingY: '5px'
  },
  title: {
    color: 'white',
    fontSize: '1em',
    fontWeight: 500
  },
  contentSection: { 
    flexWrap: 'wrap',
    columnGap: '1em',
    paddingBottom: '1em'
  },
  infoLeftBox: {
    flexBasis: '75%',
    border: '1px solid #f4f4f4',
    borderRadius: '5px'
  },
  infoRightBox: {
    flexBasis: '25%',
    border: '1px solid #f4f4f4',
    borderRadius: '5px'
  },
  infoTitle: {
    fontSize: '12px',
    paddingLeft: '.5em'
  },
  bottomBox: {
    flexBasis: '50%',
    background: '#e6fff4',
    borderRadius: '5px'
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
