import BigNumber from 'bignumber.js'

export const getBalanceInEther = (balance: BigNumber, decimals = 18) => {
  const displayBalance = new BigNumber(balance).dividedBy(new BigNumber(10).pow(decimals))
  return displayBalance.toNumber()
}

export const getBalanceInWei = (balance: number, decimals = 18) => {
  return new BigNumber(balance).multipliedBy(new BigNumber(10).pow(decimals))
}

export const getFullDisplayBalance = (balance: BigNumber, decimals = 18) => {
  return balance.dividedBy(new BigNumber(10).pow(decimals)).toFixed()
}

export const getNumberWithCommas = (x) => {
  return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ',')
}

export const getBalanceAmount = (amount: BigNumber, decimals = 18) => {
  return new BigNumber(amount).dividedBy(new BigNumber(10).pow(decimals))
}
