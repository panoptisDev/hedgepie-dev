import { useCallback, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useYBNFTMintContract } from 'hooks/useContract'
import { mintYBNFT } from 'utils/callHelpers'

export const useYBNFTMint = () => {
  const { account } = useWeb3React()
  const ybnftMintContract = useYBNFTMintContract()

  const handleMint = useCallback(
    async (allocations, tokens, addresses, performanceFee, ipfsUrl) => {
      const txHash = await mintYBNFT(
        ybnftMintContract,
        allocations,
        tokens,
        addresses,
        performanceFee,
        ipfsUrl,
        account,
      )

      console.info(txHash)
      console.log(txHash)
      return txHash
    },
    [account, ybnftMintContract],
  )

  return { onYBNFTMint: handleMint }
}
