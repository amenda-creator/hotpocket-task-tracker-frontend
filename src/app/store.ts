import { configureStore } from '@reduxjs/toolkit';
import authReducer from '../features/auth/authSlice';
import snackbarReducer from '../features/snackbar/snackbarSlice';
import tasksReducer from '../features/tasks/tasksSlice';
import clusterReducer from '../features/cluster/clusterSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    snackbar: snackbarReducer,
    tasks: tasksReducer,
    cluster: clusterReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
