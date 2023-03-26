import { createAsyncThunk, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { AppThunk, RootState } from '../app/store';
import _abiFactory from '../contractFactory.abi.json';
import _abi from '../contract.abi.json';

export interface ContractState {
  contractFactoryAddress: `0x${string}`;
  contractFactoryABI: any[];
  contractAddressTitle: string | undefined,
  contractAddress: `0x${string}` | undefined | null;
  contractABI: any[];

  needFetchGroups: boolean;
  needFetchBalance: boolean;
  needFetchUsers: boolean;
  status: 'idle' | 'loading' | 'failed';
};

const initialState: ContractState = {
  contractFactoryAddress: '0x9317513517332400889d8280eE8e012770061390',
  contractFactoryABI: _abiFactory,
  contractAddressTitle: undefined,
  contractAddress: undefined,
  contractABI: _abi,

  needFetchGroups: false,
  needFetchBalance: false,
  needFetchUsers: false,
  status: 'idle',
};

// The function below is called a thunk and allows us to perform async logic. It
// can be dispatched like a regular action: `dispatch(incrementAsync(10))`. This
// will call the thunk with the `dispatch` function as the first argument. Async
// code can then be executed and other actions can be dispatched. Thunks are
// typically used to make async requests.
// export const incrementAsync = createAsyncThunk(
//   'contract/fetchCount',
//   async (amount: number) => {
//     const response = await fetchCount(amount);
//     // The value we return becomes the `fulfilled` action payload
//     return response.data;
//   }
// );

export const contractSlice = createSlice({
  name: 'contract',
  initialState,
  // The `reducers` field lets us define reducers and generate associated actions
  reducers: {
    setContractAddressTitle: (state, action: PayloadAction<string | undefined>) => {
      state.contractAddressTitle = action.payload;
    },
    setContractAddress: (state, action: PayloadAction<`0x${string}` | undefined | null>) => {
      state.contractAddress = action.payload;
    },
    setContractABI: (state, action: PayloadAction<any[]>) => {
      state.contractABI = action.payload;
    },
    setNeedFetchGroups: (state, action: PayloadAction<boolean>) => {
      state.needFetchGroups = action.payload;
    },
    setNeedFetchBalance: (state, action: PayloadAction<boolean>) => {
      state.needFetchBalance = action.payload;
    },
    setNeedFetchUsers: (state, action: PayloadAction<boolean>) => {
      state.needFetchUsers = action.payload;
    },
  },
  // The `extraReducers` field lets the slice handle actions defined elsewhere,
  // including actions generated by createAsyncThunk or in other slices.
  // extraReducers: (builder) => {
  //   builder
  //     .addCase(incrementAsync.pending, (state) => {
  //       state.status = 'loading';
  //     })
  //     .addCase(incrementAsync.fulfilled, (state, action) => {
  //       state.status = 'idle';
  //       //state.value += action.payload;
  //     })
  //     .addCase(incrementAsync.rejected, (state) => {
  //       state.status = 'failed';
  //     });
  // },
});

export const {
  setContractAddressTitle: setContractAddressTitleAction,
  setContractAddress: setContractAddressAction,
  setContractABI: setContractABIAction,
  setNeedFetchGroups: setNeedFetchGroupsAction,
  setNeedFetchBalance: setNeedFetchBalanceAction,
  setNeedFetchUsers: setNeedFetchUsersAction
} = contractSlice.actions;

// The function below is called a selector and allows us to select a value from
// the state. Selectors can also be defined inline where they're used instead of
// in the slice file. For example: `useSelector((state: RootState) => state.contract.value)`
export const selectContractFactoryAddress = (state: RootState) => state.contract.contractFactoryAddress;
export const selectContractFactoryABI = (state: RootState) => state.contract.contractFactoryABI;
export const selectContractAddressTitle = (state: RootState) => state.contract.contractAddressTitle;
export const selectContractAddress = (state: RootState) => state.contract.contractAddress;
export const selectContractABI = (state: RootState) => state.contract.contractABI;

export const selectNeedFetchGroups = (state: RootState) => state.contract.needFetchGroups;
export const selectNeedFetchBalance = (state: RootState) => state.contract.needFetchBalance;
export const selectNeedFetchUsers = (state: RootState) => state.contract.needFetchUsers;

// We can also write thunks by hand, which may contain both sync and async logic.
// Here's an example of conditionally dispatching actions based on current state.
// export const incrementIfOdd =
//   (amount: number): AppThunk =>
//   (dispatch, getState) => {
//     const currentValue = selectCount(getState());
//     if (currentValue % 2 === 1) {
//       dispatch(incrementByAmount(amount));
//     }
//   };

export default contractSlice.reducer;
