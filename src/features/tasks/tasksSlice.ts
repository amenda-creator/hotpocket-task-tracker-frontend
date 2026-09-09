import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { Task } from '../../types';

export interface TasksState {
  items: Task[];
  loading: boolean;
}

const initialState: TasksState = {
  items: [],
  loading: false,
};

const tasksSlice = createSlice({
  name: 'tasks',
  initialState,
  reducers: {
    setTasks(state: TasksState, action: PayloadAction<Task[]>) {
      state.items = action.payload;
    },
    setLoading(state: TasksState, action: PayloadAction<boolean>) {
      state.loading = action.payload;
    },
  },
});

export const { setTasks, setLoading } = tasksSlice.actions;
export default tasksSlice.reducer;
