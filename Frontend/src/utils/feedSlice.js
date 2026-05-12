import { createSlice } from "@reduxjs/toolkit";

const feedSlice = createSlice({
    name: "feed",
    initialState: null,
    reducers: {
        setFeed: (state, action) => {
            return action.payload;
        },
        removeUserFromFeed: (state, action) => {
            if (!state) return state;
            return state.filter((user) => user._id !== action.payload);
        },
        clearFeed: () => {
            return null;
        },
    },
});

export const { setFeed, removeUserFromFeed, clearFeed } = feedSlice.actions;

export default feedSlice.reducer;
