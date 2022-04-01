import { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { fetchVaultGlobalDataAsync, fetchVaultPoolDataAsync } from './actions'
import { State, Pool, VaultState } from 'state/types'



export const useFetchPublicData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // vault
    dispatch(fetchVaultGlobalDataAsync())
    dispatch(fetchVaultPoolDataAsync())

    // ybnft
  }, [dispatch])
}

export const useVault = (): VaultState => {
  const vaultState = useSelector((state: State) => state.vault)
  return vaultState
}

export const useVaultPools = (): Pool[] => {
  const pools = useSelector((state: State) => state.vault.data)
  return pools
}
