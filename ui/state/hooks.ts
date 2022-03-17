import { useEffect } from 'react'
import BigNumber from 'bignumber.js'
import { useWeb3React } from '@web3-react/core'
import { useSelector, useDispatch } from 'react-redux'


export const useFetchPublicData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // v2
  }, [dispatch])
}

