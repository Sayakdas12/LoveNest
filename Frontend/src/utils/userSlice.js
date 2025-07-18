import { createSlice } from "@reduxjs/toolkit";

// Get user from localStorage if exists
const storedUser = localStorage.getItem("user");
const initialState = storedUser ? storedUser : null;

console.log("User Slice Initial State:", storedUser);
const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const userData = action.payload;
            localStorage.setItem("user", JSON.stringify(userData));
            return userData;
        },
        clearUser: () => {
            localStorage.removeItem("user");
            return null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;

export default userSlice.reducer;
