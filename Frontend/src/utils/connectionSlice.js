import { createSlice } from '@reduxjs/toolkit';

const connectionSlice = createSlice({
    name: 'connection',
    initialState: [],
    reducers: {
        addConnections: (state, action) => {
            return action.payload; // set full list
        },
        removeConnection: (state, action) => {
            return state.filter(conn => conn._id !== action.payload); // remove by ID
        },
        addSingleConnection: (state, action) => {
            state.push(action.payload); // add one connection
        }
    },
});

export const {
    addConnections,
    removeConnection,
    addSingleConnection
} = connectionSlice.actions;

export default connectionSlice.reducer;
