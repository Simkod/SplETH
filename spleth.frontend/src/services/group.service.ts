import { readContract, readContracts, getAccount } from '@wagmi/core';
import { ContractState } from '../reducers/contractReducer';
import { Group } from '../models';

export abstract class GroupService {

    public static async load(state: ContractState): Promise<Group[]> {
        const { address: currentWalletAddress } = getAccount();

        // get all contract addresses
        const factoryChildAddresses = (await readContract<string[], string>({
            address: state.contractFactoryAddress,
            abi: state.contractFactoryABI,
            functionName: 'getAllAddresses'
        }) as string[]);
        console.log('factoryChildAddresses', factoryChildAddresses);

        // get all users for each smart contracts
        const usersForAllContracts = (await readContracts({
            contracts: factoryChildAddresses.map(address => {
                return {
                    address: address,
                    abi: state.contractABI,
                    functionName: 'getAllUsers'
                } as any;
            })
        }) as [string[]]);

        const _myGroupAddresses: string[] = [];
        usersForAllContracts.forEach((groupUsers, index) => {
            if (currentWalletAddress && groupUsers.includes(currentWalletAddress)) {
                _myGroupAddresses.push(factoryChildAddresses[index]);
            }
        });

        // get titles
        const responseTitles = (await readContracts({
            contracts: _myGroupAddresses.map(address => {
                return {
                    address: address,
                    abi: state.contractABI,
                    functionName: 'titleWallet'
                } as any;
            })
        }) as string[]);

        const _myGroups: Group[] = [];
        responseTitles.forEach((title, index) => {
            _myGroups.push({
                address: _myGroupAddresses[index],
                title: title
            });
        });

        console.log('myGroups', _myGroups);

        return _myGroups;
    }
}
