import { createSlice } from '@reduxjs/toolkit'

const token = localStorage.getItem('accessToken')
const userStr = localStorage.getItem('user')

const initialState = {
  user: userStr ? JSON.parse(userStr) : null,
  token: token || null,
  isAuthenticated: !!token,
}

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    setCredentials: (state, action) => {
      const { accessToken, refreshToken, email, name, role } = action.payload
      state.token = accessToken
      state.user = { email, name, role }
      state.isAuthenticated = true
      localStorage.setItem('accessToken', accessToken)
      localStorage.setItem('refreshToken', refreshToken)
      localStorage.setItem('user', JSON.stringify({ email, name, role }))
    },
    logout: (state) => {
      state.user = null
      state.token = null
      state.isAuthenticated = false
      localStorage.clear()
    },
  },
})

export const { setCredentials, logout } = authSlice.actions
export default authSlice.reducer
