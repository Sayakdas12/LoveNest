import { createSlice } from "@reduxjs/toolkit";

// Get user from localStorage and safely parse it
let storedUser = null;
try {
    const rawUser = localStorage.getItem("user");
    if (rawUser) storedUser = JSON.parse(rawUser);
} catch (e) {
    console.error("Invalid user in localStorage:", e);
    localStorage.removeItem("user");
}

const initialState = storedUser || null;

console.log("User Slice Initial State:", initialState);

const userSlice = createSlice({
    name: "user",
    initialState,
    reducers: {
        setUser: (state, action) => {
            const userData = action.payload;
            localStorage.setItem("user", JSON.stringify(userData));
            return userData; // Return new user object as the new state
        },
        clearUser: () => {
            localStorage.removeItem("user");
            return null;
        },
    },
});

export const { setUser, clearUser } = userSlice.actions;
export default userSlice.reducer;
