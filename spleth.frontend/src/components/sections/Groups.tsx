import React, { useEffect, useState } from 'react'
import { readContracts, useAccount, useContractRead } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress, selectContractFactoryABI, selectContractFactoryAddress, selectNeedFetchGroups, setContractAddressAction, setContractAddressTitleAction, setNeedFetchGroupsAction } from '../../reducers/contractReducer';
import Loader from '../shared/Loader';
import './Groups.css';

export default function Groups() {
    const dispatch = useAppDispatch();
    const needFetchGroups = useAppSelector(selectNeedFetchGroups);
    const selectedContractAddress = useAppSelector(selectContractAddress);

    const [isFetchingGetAllUsers, setIsFetchingGetAllUsers] = useState<boolean>(false);
    const [myGroups, setMyGroups] = useState<{ title: string, address: string }[]>([]);

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
            console.log('factoryChildAddresses', factoryChildAddresses);

            const response = await readContracts({
                contracts: factoryChildAddresses.map(address => {
                    return {
                        address: address,
                        abi: contractABI,
                        functionName: 'getAllUsers'
                    } as any;
                })
            });

            const _myGroupAddresses: string[] = [];
            (response as [string[]]).forEach((groupUsers, index) => {
                if (currentWalletAddress && groupUsers.includes(currentWalletAddress)) {
                    _myGroupAddresses.push(factoryChildAddresses[index]);
                }
            });
            console.log('_myGroupAddresses', _myGroupAddresses);


            // get titles
            const responseTitles = await readContracts({
                contracts: _myGroupAddresses.map(address => {
                    return {
                        address: address,
                        abi: contractABI,
                        functionName: 'titleWallet'
                    } as any;
                })
            });

            const _myGroups: { title: string, address: string }[] = [];
            (responseTitles as string[]).forEach((title, index) => {
                _myGroups.push({
                    address: _myGroupAddresses[index],
                    title: title
                });
            });

            setMyGroups(_myGroups);
        } catch (error) {

        }
        setIsFetchingGetAllUsers(false);
    }

    const onSelectGroupClick = (group: { title: string, address: string }) => {
        dispatch(setContractAddressAction(group.address as `0x${string}`));
        dispatch(setContractAddressTitleAction(group.title));
    }

    useEffect(() => {
        if (needFetchGroups) {
            refetchGetAllAddresses();
            dispatch(setNeedFetchGroupsAction(false));
        }
    }, [needFetchGroups]);


    if (isFetchingGetAllAddresses || isFetchingGetAllUsers)
        return (<Loader />);

    return (
        <div className='groups'>
            <div className='groups__items'>
                <div
                    className={`groups__item button ${selectedContractAddress === null ? 'groups__item--selected' : ''}`}
                    onClick={() => dispatch(setContractAddressAction(null))}
                >
                    Add new group
                </div>

                {myGroups.map(group =>
                    <div
                        key={group.address}
                        className={`groups__item button ${selectedContractAddress === group.address ? 'groups__item--selected' : ''}`}
                        onClick={() => onSelectGroupClick(group)}
                    >
                        {group.title}
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
