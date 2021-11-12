import { transform } from '@babel/core';
import { ThemeUIStyleObject } from 'theme-ui';

const styles: Record<string, ThemeUIStyleObject> = {
  flexContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    margin: '100px 0px'
  },
  textTitle: {
    fontWeight: 'bold',
    fontSize: '70px',
    color: '#000',
    padding: '30px 0px',
    span: {
      padding: '0px 20px'
    }
  },
  textContent: {
    fontSize: '25px',
    width: '21.5%',
    textAlign: 'center',
    lineHeight: '30px'
  },
  stepsContainer: {
    padding: '20px 0px',
    border: '2px solid #3ed33e',
    marginRight: '10%'
    // justifyContent: 'space-between',
    // width: '80%',
    // margin: '0 auto',
  },
  stepContain: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',

  },
  stepTitle: {
    color: '#000'

  },
  stepContent: {
    width: '45%',
    textAlign: 'center',
    padding: '20px 0px',
    lineHeight: '25px',
    fontSize: '20px',

  },
  stepContainOne: {
    position: 'relative',
    display: 'flex',
    justifyContent: 'end',
    alignItems: 'end',
    flexDirection: 'column',
  },
  stepsOne: {
    position: 'absolute',
    transform: 'rotate(-90deg)',
    transformOrigin: 'top left',
    top: '70%',
    left: '50%',
    fontSize: '20px',
    color: 'blue',
    fontWeight: 'bold',

  },
  steps: {
    position: 'absolute',
    transform: 'rotate(-90deg)',
    transformOrigin: 'top left',
    top: '70%',
    left: '20%',
    fontSize: '20px',
    color: 'blue',
    fontWeight: 'bold',
  }

}

export default styles;