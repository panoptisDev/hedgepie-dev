import { getHpieAddress } from 'utils/addressHelpers'

export const getTokenPrice = (address: string): number => {
  const hpeiAddress = getHpieAddress();
  if (address.toLowerCase() === hpeiAddress.toLowerCase()) {
    return 10;
  }

  return 10;
}
