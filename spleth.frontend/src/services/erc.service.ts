import { readContract, fetchToken, getContract, getAccount } from '@wagmi/core';
import { erc20ABI } from 'wagmi';
import { BigNumber } from 'ethers';
import { ContractState } from '../reducers';
import { ERCToken } from '../models';

export abstract class ErcService {

    public static async loadTokenInfoByGroup(state: ContractState): Promise<ERCToken | null> {

        const { address: walletAddress } = getAccount();

        if (!walletAddress || !state.group?.address)
            return null;

        const smartContractAddress = state.group.address;

        const tokenAddress = (await readContract<string[], string>({
            address: smartContractAddress,
            abi: state.contractABI,
            functionName: 'tokenAddress'
        }) as `0x${string}` | undefined);

        if (tokenAddress) {
            const symbol = await readContract({
                address: tokenAddress,
                abi: erc20ABI,
                functionName: 'symbol'
            });

            const allowance = await readContract({
                address: tokenAddress,
                abi: erc20ABI,
                functionName: 'allowance',
                args: [walletAddress, smartContractAddress]
            });

            return {
                address: tokenAddress,
                symbol: symbol,
                allowanceToSmartContract: allowance
            }
        }

        return null;
    }

    public static async loadAllowance(state: ContractState, tokenAddress: `0x${string}`): Promise<BigNumber> {

        const { address: walletAddress } = getAccount();

        if (!walletAddress || !state.group?.address)
            return BigNumber.from(0);

        const smartContractAddress = state.group.address;

        const allowance = await readContract({
            address: tokenAddress,
            abi: erc20ABI,
            functionName: 'allowance',
            args: [walletAddress, smartContractAddress]
        });

        return allowance;
    }

}
