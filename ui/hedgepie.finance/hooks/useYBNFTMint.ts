import { useCallback, useRef } from 'react'
import { useWeb3React } from '@web3-react/core'
import { useYBNFTMintContract } from 'hooks/useContract'
import { mintYBNFT, fetchMaxTokenId, fetchTokenUri, fetchAllocations, fetchOwnerOf } from 'utils/callHelpers/binance/callHelpers'

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
      return txHash
    },
    [account, ybnftMintContract],
  )

  const getMaxTokenId = async () => {
    const maxTokenId = await fetchMaxTokenId(ybnftMintContract)
    return maxTokenId
  }

  const getOwnerOf = async (tokenId) => {
    const owner = await fetchOwnerOf(ybnftMintContract, tokenId)
    return owner
  }


  const getTokenUri = async (tokenId) => {
    const tokenUri = await fetchTokenUri(ybnftMintContract, tokenId)
    return tokenUri
  }

  const getAllocations = async (tokenId) => {
    const allocations = await fetchAllocations(ybnftMintContract, tokenId)
    return allocations
  }

  return {
    onYBNFTMint: handleMint,
    getMaxTokenId: getMaxTokenId,
    getTokenUri: getTokenUri,
    getAllocations: getAllocations,
    getOwnerOf:getOwnerOf
  }
}
