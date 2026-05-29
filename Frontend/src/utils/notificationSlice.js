import { createSlice } from "@reduxjs/toolkit";

const notificationSlice = createSlice({
  name: "notifications",
  initialState: { list: [], unreadCount: 0 },
  reducers: {
    setNotifications(state, action) {
      state.list = action.payload.notifications || [];
      state.unreadCount = action.payload.unreadCount || 0;
    },
    addNotification(state, action) {
      state.list.unshift(action.payload);
      state.unreadCount += 1;
    },
    markAllRead(state) {
      state.list = state.list.map(n => ({ ...n, read: true }));
      state.unreadCount = 0;
    },
    clearNotifications(state) {
      state.list = [];
      state.unreadCount = 0;
    },
  },
});

export const { setNotifications, addNotification, markAllRead, clearNotifications } =
  notificationSlice.actions;
export default notificationSlice.reducer;
