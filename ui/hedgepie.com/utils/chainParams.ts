import random from 'lodash/random'

const nodes = {
  97: [
    'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
    'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
    'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
  ],
  56: ['https://bsc-dataseed.binance.org', 'https://bsc-dataseed1.defibit.io', 'https://bsc-dataseed1.ninicoin.io/'],
  137:['https://polygon-rpc.com']
}

const getNodeUrl = (chainId) => {
  const randomIndex = random(0, nodes[chainId].length - 1)
  return nodes[chainId][randomIndex]
}

const chainParams = {
  '97': {
    chainId: '0x61',
    chainName: 'BSC testnet',
    nativeCurrency: {
      name: 'BSC test',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [getNodeUrl(97)],
    blockExplorerUrls: ['https://testnet.bscscan.com'],
  },
  '56': {
    chainId: '0x38',
    chainName: 'BSC mainnet',
    nativeCurrency: {
      name: 'BSC mainnet',
      symbol: 'BNB',
      decimals: 18,
    },
    rpcUrls: [getNodeUrl(56)],
    blockExplorerUrls: ['https://bscscan.com'],
  },
  '137': {
    chainId: '0x38',
    chainName: 'Polygon Mainnet',
    nativeCurrency: {
      name: 'Polygon MATIC',
      symbol: 'MATIC',
      decimals: 18,
    },
    rpcUrls: [getNodeUrl(137)],
    blockExplorerUrls: ['https://polygonscan.com/'],
  },
}

export default chainParams
