import { createSlice, type PayloadAction } from "@reduxjs/toolkit"
import type { AuthUser } from "@/lib/types"

export type AuthStatus = "loading" | "authenticated" | "unauthenticated"

export interface AuthState {
  user: AuthUser | null
  status: AuthStatus
}

const initialState: AuthState = {
  user: null,
  status: "loading",
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setSession: (state, action: PayloadAction<AuthUser | null>) => {
      state.user = action.payload
      state.status = action.payload ? "authenticated" : "unauthenticated"
    },
  },
})

export const { setSession } = authSlice.actions
export default authSlice.reducer
