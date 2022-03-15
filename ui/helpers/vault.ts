import { ethers } from "ethers";
import { addresses } from "../constants/address";
import { JsonRpcSigner, StaticJsonRpcProvider } from "@ethersproject/providers";

import VaultABI from "../abi/HedgepieVault.json";
import MockABI from "../abi/MockupToken.json";

export const getInfo = async(
    // networkID: number,
    provider: StaticJsonRpcProvider | JsonRpcSigner
) => {
    const networkID = 97;
    const vaultContract = new ethers.Contract(
        addresses[networkID].VAULT_ADDRESS as string,
        VaultABI,
        provider,
    );

    const tokenContract = new ethers.Contract(
        addresses[networkID].MOCLUP_ADDRESS as string,
        MockABI,
        provider
    );

    const tvl = Number(await tokenContract.balanceOf(addresses[networkID].VAULT_ADDRESS as string));
    const blockReward = Number(await vaultContract.blockEmission());
    const rpd = tvl === 0 ? 0 : (blockReward * 86400 / 3) / (tvl / Math.pow(10, 18));
    const apy = (Math.pow(1 + rpd, 365) - 1).toFixed(2);

    return {
        tvl,
        apy,
        profit: 0,
        staked: 0
    };
}