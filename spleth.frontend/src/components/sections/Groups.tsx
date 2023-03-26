import React, { useEffect, useState } from 'react'
import { readContracts, useAccount, useContractRead } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress, selectContractFactoryABI, selectContractFactoryAddress, selectNeedFetchGroups, setContractAddressAction, setNeedFetchGroupsAction } from '../../reducers/contractReducer';
import Loader from '../shared/Loader';
import './Groups.css';

export default function Groups() {
    const dispatch = useAppDispatch();
    const needFetchGroups = useAppSelector(selectNeedFetchGroups);
    const selectedGroup = useAppSelector(selectContractAddress);

    const [isFetchingGetAllUsers, setIsFetchingGetAllUsers] = useState<boolean>(false);
    const [myGroups, setMyGroups] = useState<string[]>([]);

    const { address: currentWalletAddress } = useAccount();

    const contractAddressFactory = useAppSelector(selectContractFactoryAddress);
    const contractFactoryABI = useAppSelector(selectContractFactoryABI);

    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const { error, isFetching: isFetchingGetAllAddresses, isFetched, refetch: refetchGetAllAddresses } = useContractRead({
        address: contractAddressFactory,
        abi: contractFactoryABI,
        functionName: 'getAllAddresses',
        onError: (error) => {
            setMyGroups([]);
        },
        onSuccess: (data: string[]) => {
            loadGroupUsers(data);
        }
    });

    const loadGroupUsers = async (factoryChildAddresses: string[]) => {
        setIsFetchingGetAllUsers(true);
        try {
            const response = await readContracts({
                contracts: factoryChildAddresses.map(address => {
                    return {
                        address: address,
                        abi: contractABI,
                        functionName: 'getAllUsers'
                    } as any;
                })
            });

            const _myGroups: string[] = [];
            (response as [string[]]).forEach((groupUsers, index) => {
                if (currentWalletAddress && groupUsers.includes(currentWalletAddress)) {
                    _myGroups.push(factoryChildAddresses[index]);
                }
            });
            setMyGroups(_myGroups);
        } catch (error) {

        }
        setIsFetchingGetAllUsers(false);
    }

    const onSelectGroupClick = (contractAddress: string) => {
        dispatch(setContractAddressAction(contractAddress as `0x${string}`));
    }

    useEffect(() => {
        if (needFetchGroups) {
            refetchGetAllAddresses();
            dispatch(setNeedFetchGroupsAction(false));
        }
    }, [needFetchGroups])
    

    if (isFetchingGetAllAddresses || isFetchingGetAllUsers)
        return (<Loader />);

    return (
        <div className='groups'>
            <div className='groups__items'>
                <div
                    className={`groups__item button ${selectedGroup === null ? 'groups__item--selected' : ''}`}
                    onClick={() => dispatch(setContractAddressAction(null))}
                >
                    Add new group
                </div>

                {myGroups.map(group =>
                    <div
                        key={group}
                        className={`groups__item button ${selectedGroup === group ? 'groups__item--selected' : ''}`}
                        onClick={() => onSelectGroupClick(group)}
                    >
                        {group}
                    </div>
                )}
            </div>

            {error &&
                <div className='container__error'>
                    {error.message}
                </div>}
        </div>
    )
}
