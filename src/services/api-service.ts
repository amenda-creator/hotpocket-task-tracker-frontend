import ContractService from './contract-service';
import type {
  ClusterUnl,
  CompleteTaskResult,
  ContractError,
  ContractErrorObject,
  ContractVersion,
  Task,
  UpdateClusterConfigInput,
  UpdateClusterDetailsInput,
} from '../types';

function errorToMessage(err: ContractError): string {
  if (typeof err === 'string') return err;
  const obj = err as ContractErrorObject;
  return obj.message || 'Request failed.';
}

export default class ApiService {
  private static instance: ApiService;
  private readonly contract: ContractService;

  private constructor() {
    this.contract = ContractService.getInstance();
  }

  static getInstance(): ApiService {
    if (!ApiService.instance) ApiService.instance = new ApiService();
    return ApiService.instance;
  }

  // -----------------
  // Tasks (business)
  // -----------------

  async getTasks(): Promise<Task[]> {
    try {
      const res = await this.contract.submitContractReadRequest<Task[]>({
        Service: 'Tasks',
        Action: 'GetTasks',
      });
      return res ?? [];
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }

  async completeTask(taskId: number): Promise<CompleteTaskResult> {
    try {
      return await this.contract.submitInputToContract<CompleteTaskResult>({
        Service: 'Tasks',
        Action: 'CompleteTask',
        data: { taskId },
      });
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }

  // -----------------
  // Cluster (business)
  // -----------------

  async getClusterUnl(): Promise<ClusterUnl> {
    try {
      return await this.contract.submitContractReadRequest<ClusterUnl>({
        Service: 'Cluster',
        Action: 'GetClusterUnl',
      });
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }

  async getContractVersion(): Promise<ContractVersion> {
    try {
      return await this.contract.submitContractReadRequest<ContractVersion>({
        Service: 'Cluster',
        Action: 'GetContractVersion',
      });
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }

  async updateClusterConfig(input: UpdateClusterConfigInput): Promise<unknown> {
    try {
      return await this.contract.submitInputToContract<unknown>({
        Service: 'Cluster',
        Action: 'UpdateClusterConfig',
        data: input,
      });
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }

  async updateClusterDetails(input: UpdateClusterDetailsInput): Promise<{ peers: string[] }> {
    try {
      return await this.contract.submitInputToContract<{ peers: string[] }>({
        Service: 'Cluster',
        Action: 'UpdateClusterDetails',
        data: { clusterDetails: input.clusterDetails },
      });
    } catch (e: unknown) {
      throw new Error(typeof e === 'string' ? e : (e as any)?.message ?? errorToMessage(e as any));
    }
  }
}
