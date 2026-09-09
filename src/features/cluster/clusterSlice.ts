import { createSlice, type PayloadAction } from '@reduxjs/toolkit';

export interface ClusterState {
  unl: string[];
  version: number | null;
}

const initialState: ClusterState = {
  unl: [],
  version: null,
};

const clusterSlice = createSlice({
  name: 'cluster',
  initialState,
  reducers: {
    setUnl(state: ClusterState, action: PayloadAction<string[]>) {
      state.unl = action.payload;
    },
    setVersion(state: ClusterState, action: PayloadAction<number | null>) {
      state.version = action.payload;
    },
  },
});

export const { setUnl, setVersion } = clusterSlice.actions;
export default clusterSlice.reducer;
