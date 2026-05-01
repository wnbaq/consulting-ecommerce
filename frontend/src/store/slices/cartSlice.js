import { createSlice } from '@reduxjs/toolkit'

const cartSlice = createSlice({
  name: 'cart',
  initialState: {
    data: null,
    itemCount: 0,
  },
  reducers: {
    setCart: (state, action) => {
      state.data = action.payload
      state.itemCount = action.payload?.items?.length ?? 0
    },
    clearCartState: (state) => {
      state.data = null
      state.itemCount = 0
    },
  },
})

export const { setCart, clearCartState } = cartSlice.actions
export default cartSlice.reducer
