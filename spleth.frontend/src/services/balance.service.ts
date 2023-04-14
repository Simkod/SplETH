import { readContract, getAccount } from '@wagmi/core';
import { BigNumber } from 'ethers';
import { ContractState } from '../reducers';
import { readContracts } from 'wagmi';
import { User } from '../models';

export abstract class BalanceService {

    public static async loadUserAndSmartContractBalance(state: ContractState): Promise<BalanceResponse> {

        const { address: walletAddress } = getAccount();

        if (!walletAddress || !state.group?.address)
            return {
                user: BigNumber.from(0),
                smartContract: BigNumber.from(0)
            };

        const smartContractAddress = state.group.address;
        const isERCMode = !!state.erc20Token;

        const walletBalance = (await readContract<string[], string>({
            address: smartContractAddress,
            abi: state.contractABI,
            functionName: 'getBalance',
            args: [walletAddress]
        }) as BigNumber[]);

        const smartContractBalance = (await readContract<string[], string>({
            address: smartContractAddress,
            abi: state.contractABI,
            functionName: isERCMode ? 'ercBalance' : 'balance'
        }) as BigNumber);

        // Users Balance

        return {
            user: isERCMode ? walletBalance[1] : walletBalance[0],
            smartContract: smartContractBalance
        };
    }

    public static async loadUsersBalance(state: ContractState): Promise<User[]> {

        if (!state.users.length || !state.group?.address)
            return [];

        const response = await readContracts({
            contracts: state.users.map(user => {
                return {
                    address: state.group?.address,
                    abi: state.contractABI,
                    functionName: 'getBalance',
                    args: [user.address],
                } as any;
            })
        });

        const _usersBalances: User[] = [];
        (response as BigNumber[][]).forEach((balance, index) => {
            _usersBalances.push({
                address: state.users[index].address,
                balance: state.erc20Token ? balance[1] : balance[0]
            });
        });
        console.log('loadUsersBalance', _usersBalances);
        return _usersBalances;
    }

}

export class BalanceResponse {
    constructor(
        public user: BigNumber,
        public smartContract: BigNumber
    ) {
    }
}