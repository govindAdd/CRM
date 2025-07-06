// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice'; // Correct relative path
import publicProfileReducer from "./publicProfileSlice";
import userReducer from "./userSlice";
import departmentReducer from "./departmentSlice";
export const store = configureStore({
  reducer: {
    auth: authSlice,
    publicProfile: publicProfileReducer,
    user: userReducer,
    department: departmentReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false, // For tokens/cookies
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
