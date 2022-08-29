import axios from 'axios'
export const getPrice = async (tokenName:string) => {
  let symbol
  switch(tokenName) {
    case 'BNB':
      symbol = 'BNBUSDC'
      break
    case 'MATIC':
      symbol = 'MATICUSDT'
      break
    case 'ETH':
      symbol = 'ETHUSDC'
        break
    default:
      // Having the Default token as BNB as we will be interacting with the BSC chain
      symbol = 'BNBUSDC'
      break
  }
  try {
    const res = await axios.get(`https://api.binance.com/api/v3/avgPrice?symbol=${symbol}`)
    if (res?.data?.price) {
      return Number(res.data.price)
    }
    return null
  } catch (err) {
    console.log(err)
    return null
  }
}
