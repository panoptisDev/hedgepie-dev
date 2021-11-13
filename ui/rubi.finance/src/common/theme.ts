import { Theme, ThemeUIStyleObject } from 'theme-ui';
import MimoblTheme from 'common/theme.json';

const cardBase: ThemeUIStyleObject = {
  display: 'flex',
  flexDirection: 'column',
  minWidth: 0,
  wordWrap: 'break-word',
  backgroundColor: '#fff',
  backgroundClip: 'border-box',
  border: '0 solid #f1f4f8',
  borderRadius: '.375rem',
  boxShadow: '0 1.5rem 4rem rgba(22,28,45,.1)!important',
};

const buttonBase: ThemeUIStyleObject = {
  cursor: 'pointer',
  borderRadius: '20px',
  background: 'none',
  color: 'black',
  border: '1px solid black',
  transition: 'box-shadow .25s ease,transform .25s ease',
  ':hover': {
    opacity: '0.7',
    boxShadow: '0 1rem 2.5rem rgba(22, 28, 45, .1),0 .5rem 1rem -.75rem rgba(22, 28, 45, .1)',
    transform: 'translate3d(0,-3px,0)',
  },
  '&[disabled]': {
    opacity: '0.6',
  },
};

const theme: Theme = {
  breakpoints: ['600px', '900px', '1400px'],
  fonts: {
    body: '"Avenir Next", "Lark"',
    heading: '"Avenir Next", sans-serif',
    monospace: 'Menlo, monospace',
  },
  colors: {
    ...MimoblTheme.colors,
    text: '#000',
    background: 'transparent',
    secondary: '#F05A26',
    highlight: MimoblTheme.colors.secondary,
  },
  buttons: {
    primary: {
      ...buttonBase,
      border: 'none',
      color: MimoblTheme.buttons.primary.color,
      background: MimoblTheme.buttons.primary['background-color'],
    },
    secondary: {
      ...buttonBase,
      border: 'none',
      color: MimoblTheme.buttons.secondary.color,
      bg: MimoblTheme.buttons.secondary['background-color'],
    },
    highlight: {
      ...buttonBase,
      border: 'none',
      background: '#00C7B1',
    },
    danger: {
      ...buttonBase,
      border: 'none',
      background: '#ff4d4f',
    },
    default: buttonBase,
  },
  cards: {
    primary: {
      ...cardBase,
      padding: '2rem',
    },
    noPadding: cardBase,
  },
  text: {
    heading: {
      color: MimoblTheme.colors.primary,
      lineHeight: '1.35',
      fontFamily: '"Avenir Next", "Lark"'
    },
    default: {
      color: '#7d7d7d',
      fontFamily: '"Avenir Next", "Lark"'
    },
    block: {
      color: '#7d7d7d',
      display: 'block',
      fontFamily: '"Avenir Next", "Lark"'
    },
    softPurple: {
      color: '#b4b0f1',
      fontWeight: 400,
      lineHeight: '1.6',
      fontFamily: '"Avenir Next", "Lark"'
    },
    primary: {
      color: MimoblTheme.colors.primary,
      fontFamily: '"Avenir Next", "Lark"'
    }
  },
  messages: {
    default: {
      borderLeftColor: MimoblTheme.colors.primary,
      bg: 'rgba(167 164 224 / .25)',
    }
  },
  styles: {
    a: {
      color: MimoblTheme.colors.primary,
      cursor: 'pointer',
      ':hover': {
        color: MimoblTheme.colors.secondary,
      },
    },
    hr: {
      m: 0,
      color: '#f1f4f8',
      height: '1px',
    },
  },
  forms: {
    input: {
      borderRadius: '.375rem',
      border: '1px solid #d9d9d9',
    }
  },
  alerts: {
    error: {
      bg: '#ff4d4f',
    }
  }
};

export default theme;
