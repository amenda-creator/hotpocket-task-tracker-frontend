export interface ContractMessage {
  Service: string;
  Action: string;
  data?: unknown;
}

export interface ContractErrorObject {
  code: number;
  message: string;
}

export type ContractError = string | ContractErrorObject;

export interface ContractResponse<T = unknown> {
  success?: T;
  error?: ContractError;
  promiseId?: string;
}

// ----------------------------
// Tasks service models
// ----------------------------

export interface Task {
  id: number;
  taskId: number;
  description: string;
  isCompleted: boolean;
}

export interface CompleteTaskInput {
  taskId: number;
}

export interface CompleteTaskResult {
  taskId: number;
  isCompleted: boolean;
}

// ----------------------------
// Cluster service models
// ----------------------------

export interface ClusterUnl {
  unl: string[];
}

export interface ContractVersion {
  version: number;
}

export type ClusterConfigAction = 'add' | 'remove';

export interface UpdateClusterConfigInput {
  action: ClusterConfigAction;
  publicKey: string;
}

export interface ClusterDetailsItem {
  domain: string;
  peer_port: number;
  pubkey: string;
}

export interface UpdateClusterDetailsInput {
  clusterDetails: ClusterDetailsItem[];
}
