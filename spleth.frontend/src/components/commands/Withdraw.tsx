import { useState } from 'react';
import { useContractWrite, usePrepareContractWrite, useWaitForTransaction } from 'wagmi';
import { useAppDispatch, useAppSelector } from '../../app/hooks';
import { selectContractABI, selectContractAddress, setNeedFetchBalanceAction } from '../../reducers/contractReducer';
import Emoji from '../shared/Emoji';
import Deposit from './Deposit';

export default function Withdraw() {
    const dispatch = useAppDispatch();
    const contractAddress = useAppSelector(selectContractAddress);
    const contractABI = useAppSelector(selectContractABI);

    const [isReady, setIsReady] = useState(false);

    const {
        config,
        error: prepareError,
        isError: isPrepareError
    } = usePrepareContractWrite({
        enabled: isReady,
        address: contractAddress as any,
        abi: contractABI,
        functionName: 'withdraw',
        onError: (error) => console.error('withdraw', error),
    });
    const { data, error, isError, write, reset } = useContractWrite(config);
    const { isLoading, isSuccess } = useWaitForTransaction({
        hash: data?.hash,
        onSuccess(data) {
            dispatch(setNeedFetchBalanceAction(true));

            setTimeout(() => {
                reset();
            }, 5000);
        }
    });

    return (
        <div className='container'>
            <div className='container__title'>Withdraw</div>
            <label>
                <input type="checkbox" onChange={() => setIsReady(!isReady)} />
                Ready to
            </label>

            <button disabled={!write || isLoading} onClick={() => write?.()}>
                {isLoading ? 'Withdrawing...' : 'withdraw'}
            </button>
            <div>
                {isSuccess && (
                    <div className='container__success'>
                        Successfully withdrew!
                        <a
                            href={`https://mumbai.polygonscan.com/tx/${data?.hash}`}
                            style={{ margin: '10px' }}
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
