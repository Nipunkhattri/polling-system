import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  name: "",
  role: "",
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    setUser: (state, action) => {
      state.name = action.payload.name;
      state.role = action.payload.role;
    },
  },
});

export const { setUser } = userSlice.actions;
export default userSlice.reducer;