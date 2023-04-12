import { configureStore, ThunkAction, Action } from '@reduxjs/toolkit';
import contractReducer from '../reducers/contractReducer';

export const store = configureStore({
  reducer: {
    contract: contractReducer,
  },
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({
    serializableCheck: false
  }),
});

export type AppDispatch = typeof store.dispatch;
export type RootState = ReturnType<typeof store.getState>;
export type AppThunk<ReturnType = void> = ThunkAction<
  ReturnType,
  RootState,
  unknown,
  Action<string>
>;
