import { ethers } from 'ethers';
import { ChangeEvent, useState } from 'react'
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractState, setNeedFetchBalanceAction } from '../../reducers/contractReducer';
import { isNumeric } from '../../utils';
import Emoji from '../shared/Emoji';

export default function Spend() {
    const dispatch = useAppDispatch();
    const state = useAppSelector(selectContractState);

    const [amount, setAmount] = useState<string>('');
    const [comment, setComment] = useState<string>('');
    const [recipientAddress, setRecipientAddress] = useState<`0x${string}` | undefined | string>('');

    const functionName = state.erc20Token ? 'spendERC' : 'spend';

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        address: state.group?.address,
        abi: state.contractABI,
        functionName: functionName,
        args: [
            isNumeric(amount) && amount ? ethers.utils.parseEther(amount as string) : undefined,
            recipientAddress,
            comment
        ],
        enabled: !!amount && !!recipientAddress,
        onError: (error) => console.error(functionName, error),
    });
    const { data, error, isError, write, reset } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            setAmount('');
            setComment('');
            setRecipientAddress('');
            dispatch(setNeedFetchBalanceAction(true));

            setTimeout(() => reset(), 5000);
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
                        Successfully spent!
                        <a
                            href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                            title='Open mumbai.polygonscan.com'
                            className='button'
                            target='_blank'
                        >
                            <Emoji symbol='🔗' />
                        </a>
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
