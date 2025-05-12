import {createAsyncThunk, createSlice} from '@reduxjs/toolkit';
import { AppDispatch } from '../store';


export const checkReferralCode = createAsyncThunk<null, string, {dispatch: AppDispatch}>(
  'referral/checkCode',
   async (errorMessage, thunkAPI) => {
        if (errorMessage) {
          thunkAPI.dispatch(errorState(errorMessage));
        } 
          return null;
    })


  
    
const referralSlice = createSlice({
  name: 'referral',
    initialState: {
        error: null,
        user: null,
    },
    reducers: { 
        errorState: (state, action) => {
            state.error = action.payload;
        },
        setUser: (state, action) => {
      state.user = action.payload;
    },
}
})

export const {errorState, setUser}  = referralSlice.actions;
export default referralSlice;