import { ethers } from 'ethers';
import { useState } from 'react';
import {
    useAccount,
    useContractWrite,
    usePrepareContractWrite,
    useWaitForTransaction,
} from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { fetchBalanceAsync, fetchERCTokenInfoAsync, selectContractState } from '../../reducers/contractReducer';
import { isNumeric } from '../../utils';
import Emoji from '../shared/Emoji';
import _erc20ABI from '../../erc20.abi.json';

export default function Deposit() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const [amount, setAmount] = useState('');

    const { address } = useAccount();

    // allowance
    const {
        config: configAllowance,
        error: prepareErrorAllowance,
        isError: isPrepareErrorAllowance
    } = usePrepareContractWrite({
        address: state.erc20Token?.address,
        abi: _erc20ABI,
        functionName: 'increaseAllowance',
        enabled: state.erc20Token?.allowanceToSmartContract.isZero() && !!state.erc20Token?.address && !!amount,
        args: [state.group?.address, amount ? ethers.utils.parseUnits(amount, 'ether') : 0],
        onError: (error) => console.error('increaseAllowance', error),
        onSuccess: (data) => console.log('increaseAllowance', data)
    });
    const {
        data: dataAllowance,
        error: errorAllowance,
        isError: isErrorAllowance,
        write: writeAllowance,
        reset: resetAllowance
    } = useContractWrite(configAllowance);
    const {
        isLoading: isLoadingAllowance,
        isSuccess: isSuccessAllowance
    } = useWaitForTransaction({
        hash: dataAllowance?.hash,
        onSuccess(data) {
            dispatch(fetchERCTokenInfoAsync());
            setTimeout(() => resetAllowance(), 5000);
        },
        onError: (error) => console.error('increaseAllowance useWaitForTransaction', error),
    });
    // end allowance



    // depositERC
    const {
        config: configDepositERC,
        error: prepareErrorDepositERC,
        isError: isPrepareErrorDepositERC
    } = usePrepareContractWrite({
        address: state.group?.address,
        abi: state.contractABI,
        functionName: 'depositERC',
        enabled: !!state.erc20Token && !state.erc20Token.allowanceToSmartContract.isZero() && !!amount,
        args: [amount ? ethers.utils.parseUnits(amount, 'ether') : 0],
        onError: (error) => console.error('depositERC', error),
        onSuccess: (data) => console.log('depositERC', data)
    });
    const {
        data: dataDepositERC,
        error: errorDepositERC,
        isError: isErrorDepositERC,
        write: writeDepositERC,
        reset: resetDepositERC
    } = useContractWrite(configDepositERC);
    const {
        isLoading: isLoadingDepositERC,
        isSuccess: isSuccessDepositERC
    } = useWaitForTransaction({
        hash: dataDepositERC?.hash,
        onSuccess(data) {
            setAmount('');
            dispatch(fetchERCTokenInfoAsync());
            setTimeout(() => resetDepositERC(), 5000);
        }
    });
    // end depositERC



    // deposit native token
    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: state.group?.address,
        abi: state.contractABI,
        functionName: 'deposit',
        enabled: !state.erc20Token && !!amount,
        overrides: {
            from: address,
            value: amount ? ethers.utils.parseEther(amount) : undefined
        },
        onError: (error) => console.error('deposit', error),
        onSuccess: (data) => console.log('deposit', data)
    });
    const { data, error, isError, write, reset } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            setAmount('');
            dispatch(fetchBalanceAsync());

            setTimeout(() => reset(), 5000);
        }
    });
    // end

    const allowance = state.erc20Token && ethers.utils.formatUnits(state.erc20Token.allowanceToSmartContract);

    return (
        <>
            <div className='container'>
                <div className='container__title'>Deposit</div>
                {!state.erc20Token?.allowanceToSmartContract.isZero() &&
                    <div>
                        You are allowed to deposit {allowance} {state.erc20Token?.symbol}
                    </div>}
                <div style={{ display: 'flex' }}>
                    <input
                        type='text'
                        onChange={(e) => setAmount(state => e.target.value === '' || isNumeric(e.target.value) ? e.target.value : state)}
                        placeholder='Amount'
                        value={amount}
                        style={{ flexGrow: 1 }}
                    />
                    {state.erc20Token?.allowanceToSmartContract.isZero() &&
                        <button disabled={isLoadingAllowance || !writeAllowance || !amount} onClick={() => writeAllowance?.()}>
                            {isLoadingAllowance ? 'Allowing...' : 'Allowance'}
                        </button>}
                    {!state.erc20Token?.allowanceToSmartContract.isZero() &&
                        <button disabled={isLoadingDepositERC || !writeDepositERC || !amount} onClick={() => writeDepositERC?.()}>
                            {isLoadingDepositERC ? 'Sending...' : 'Deposit'}
                        </button>}
                    {false &&
                        <button disabled={isLoading || !write || !amount} onClick={() => write?.()}>
                            {isLoading ? 'Sending...' : 'Deposit'}
                        </button>}
                </div>
                <div>
                    {isSuccess && (
                        <div className='container__success'>
                            Successfully deposited {amount}
                            <a className='button' href={`https://mumbai.polygonscan.com/tx/${data?.hash}`} target='_blank'><Emoji symbol='🔗' /></a>
                        </div>
                    )}
                    {(isPrepareError || isError) && (
                        <div className='container__error'>
                            Error: {(prepareError || error)?.message} <br />
                            {/* {(prepareError || error as any)?.data?.message} */}
                        </div>
                    )}
                </div>
            </div>
        </>
    )
}
