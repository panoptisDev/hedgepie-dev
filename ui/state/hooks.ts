import { useEffect } from 'react'
import { useDispatch } from 'react-redux'
import { fetchVaultGlobalDataAsync, fetchVaultPoolDataAsync } from './actions'



export const useFetchPublicData = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // vault
    dispatch(fetchVaultGlobalDataAsync())
    dispatch(fetchVaultPoolDataAsync())
    // ybnft

  }, [dispatch])
}

