import { readContract, fetchToken } from '@wagmi/core';
import { ContractState } from '../reducers';
import { ERCToken } from '../models';

export abstract class ErcService {

    public static async loadTokenInfoByGroup(state: ContractState): Promise<ERCToken | null> {
        console.log('loadTokenInfoByGroup', state.group?.address);
        if (state.group?.address) {
            const tokenAddress = (await readContract<string[], string>({
                address: state.group.address,
                abi: state.contractABI,
                functionName: 'tokenAddress'
            }) as `0x${string}` | undefined);
            console.log('tokenAddress', tokenAddress);

            if (tokenAddress) {
                const tokenInfo = await fetchToken({
                    address: tokenAddress,
                });

                console.log('tokenInfo', tokenInfo);

                return {
                    address: tokenAddress,
                    symbol: tokenInfo.symbol
                }
            }
        }

        return null;
    }
}
