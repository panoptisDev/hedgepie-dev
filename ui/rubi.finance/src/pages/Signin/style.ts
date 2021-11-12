import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  wrapper: {
    flexDirection: 'column',
    height: '100vh',
    alignItems: 'center',
    justifyContent: 'center'
  },
  container: {
    width: ['80%', '50%']
  },
  title: {
    fontSize: '2em',
    color: 'black',
    fontWeight: '500',
    marginBottom: '1em'
  },
  textBox: {
    borderRadius: '5px',
    background: '#e6fff4',
    color: '#68e3b4',
    fontSize: '12px',
    paddingLeft: '1em',
    border: 'none',
    marginBottom: '1em',

    '::placeholder': { /* Chrome, Firefox, Opera, Safari 10.1+ */
      color: '#68e3b4',
      opacity: 1 /* Firefox */
    },
    
    ':-ms-input-placeholder': { /* Internet Explorer 10-11 */
      color: '#68e3b4'
    },
    
    '::-ms-input-placeholder': { /* Microsoft Edge */
      color: '#68e3b4'
    }
  },
  cta: {
    fontSize: '8px',
    paddingX: '6em',
    marginTop: '1em'
  }
};

export default styles;
