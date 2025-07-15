import { configureStore } from '@reduxjs/toolkit';
import authSlice from './authSlice';
import publicProfileReducer from './publicProfileSlice';
import userReducer from './userSlice';
import { departmentReducer, departmentEmployeesReducer } from './departmentSlice';
import attendanceReducer from './attendanceSlice';
import hrReducer from './hrSlice';               // ✅ New
import leaveReducer from './leaveSlice';         // ✅ New

export const store = configureStore({
  reducer: {
    auth: authSlice,
    publicProfile: publicProfileReducer,
    user: userReducer,
    department: departmentReducer,
    departmentEmployees: departmentEmployeesReducer,
    attendance: attendanceReducer,
    hr: hrReducer,
    leave: leaveReducer,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({
      serializableCheck: false,
    }),
  devTools: process.env.NODE_ENV !== 'production',
});
