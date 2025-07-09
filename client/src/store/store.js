// src/store/store.js
import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import publicProfileReducer from "./publicProfileSlice";
import userReducer from "./userSlice";
import { departmentReducer, departmentEmployeesReducer } from "./departmentSlice";
import attendanceReducer from "./attendanceSlice";

export const store = configureStore({
  reducer: {
    auth: authSlice,
    publicProfile: publicProfileReducer,
    user: userReducer,
    department: departmentReducer,
    departmentEmployees: departmentEmployeesReducer,
    attendance: attendanceReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});