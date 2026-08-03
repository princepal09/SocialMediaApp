import { createSlice, PayloadAction } from "@reduxjs/toolkit";

interface IUser {
  _id: string;
  username: string;
  email: string;
}

interface AuthState {
  user: IUser | null;
  isAuthenticated: boolean;
  loading: boolean;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: true,
};

const authSlice = createSlice({
  name: "auth",
  initialState,

  reducers: {
    setLoading(state, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },

    setUser(state, action: PayloadAction<IUser>) {
      state.user = action.payload;
      state.isAuthenticated = true;
      state.loading = false;
    },

    logout(state) {
      state.user = null;
      state.isAuthenticated = false;
      state.loading = false;
    },
  },
});

export const { setLoading, setUser, logout } = authSlice.actions;
export default authSlice.reducer;