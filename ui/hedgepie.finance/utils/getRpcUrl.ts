import random from 'lodash/random'

export const nodes = [
  'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
  'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
  'https://speedy-nodes-nyc.moralis.io/1c8d8856c017266c637672dd/bsc/testnet',
]

const getNodeUrl = () => {
  const randomIndex = random(0, nodes.length - 1)
  return nodes[randomIndex]
}

export default getNodeUrl
