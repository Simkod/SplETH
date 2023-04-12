import { readContract, readContracts, getAccount } from '@wagmi/core';
import { ContractState } from '../reducers/contractReducer';
import { Group } from '../models';
import { Dispatch } from 'redux';

export abstract class GroupService {

    public static async load(state: ContractState, dispach: Dispatch): Promise<Group[]> {
        const { address: currentWalletAddress } = getAccount();

        // get all contract addresses
        const factoryChildAddresses = (await readContract<string[], string>({
            address: state.contractFactoryAddress,
            abi: state.contractFactoryABI,
            functionName: 'getAllAddresses'
        }) as `0x${string}`[]);

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

        const _myGroupAddresses: `0x${string}`[] = [];
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

        console.log('factoryChildAddresses', factoryChildAddresses, 'myGroups', _myGroups);

        return _myGroups;
    }
}
