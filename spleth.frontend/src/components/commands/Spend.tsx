import { ethers } from 'ethers';
import { ChangeEvent, useState } from 'react'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import useDebounce from '../../hooks/useDebounce';
import { selectContractABI, selectContractAddress, setNeedFetchBalanceAction } from '../../reducers/contractReducer';
import { isNumeric } from '../../utils';
import Emoji from '../shared/Emoji';

export default function Spend() {
    const dispatch = useAppDispatch();
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [amount, setAmount] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const debouncedAmount = useDebounce(amount);
    const [recipientAddress, setRecipientAddress] = useState<`0x${string}` | undefined | string>('');
    const debouncedRecipientAddress = useDebounce(recipientAddress);

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: contractAddress as any,
        abi: contractABI,
        functionName: 'spend',
        args: [
            isNumeric(amount) ? ethers.utils.parseEther(amount as string) : undefined,
            debouncedRecipientAddress,
            comment
        ],
        enabled: Boolean(debouncedAmount) && Boolean(debouncedRecipientAddress),
        onError: (error) => console.error('spend', error),
    });
    const { data, error, isError, write } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            dispatch(setNeedFetchBalanceAction(true));
        },
    });

    return (
        <div className='container'>
            <div className='container__title'>Spend</div>
            <div>
                <div style={{ display: 'flex' }}>
                    <input
                        type='text'
                        value={recipientAddress}
                        onChange={(e) => setRecipientAddress(state => e.target.value === '' || e.target.value.match(/^0x[a-fA-F0-9]{40}$/ig) ? e.target.value : state)}
                        placeholder='Recipient address'
                        style={{ flexGrow: 1 }}
                    />
                </div>
                <div style={{ display: 'flex' }}>
                    <input
                        type='text'
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder='Comment'
                        style={{ flexGrow: 1 }}
                    />
                </div>
                <div style={{ display: 'flex' }}>
                    <input
                        type='text'
                        value={amount}
                        onChange={(e) => setAmount(state => e.target.value === '' || isNumeric(e.target.value) ? e.target.value : state)}
                        placeholder='Amount'
                        style={{ flexGrow: 1 }}
                    />
                    <button disabled={!write || isLoading} onClick={() => write?.()}>
                        {isLoading ? 'Spending...' : 'spend'}
                    </button>
                </div>

                {isSuccess && (
                    <div className='container__success'>
                        Successfully spended!
                        <div>
                            <a
                                href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                                style={{ margin: '10px' }}
                                title='Open mumbai.polygonscan.com'
                                className='button'
                                target='_blank'
                            >
                                <Emoji symbol='🔗' /> mumbai.polygonscan.com
                            </a>
                        </div>
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
    )
}
