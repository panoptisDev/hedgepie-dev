import { useContext } from 'react'
import { Web3Context } from '../contexts/web3Context'

const useWeb3Context = () => {
  const {
    account,
    chainId,
    onConnect,
  } = useContext(Web3Context)

  return {
    account,
    chainId,
    onConnect,
  }
}

export default useWeb3Context
