const withPWA = require('next-pwa')

module.exports = withPWA({
  pwa: {
    dest: 'public',
    register: true,
    skipWaiting: true,
  },
  env: {
    REACT_APP_CHAIN_ID: '97',
  },
})
