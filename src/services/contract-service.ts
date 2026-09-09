import type { ContractMessage, ContractResponse, Task, ClusterUnl, ContractVersion } from '../types';

const HotPocket = (window as any).HotPocket;

interface PendingResolver {
  resolve: (value: any) => void;
  reject: (reason?: any) => void;
}

export default class ContractService {
  private static instance: ContractService;

  private client: any = null;
  private keyPair: any = null;
  private connected = false;
  private mockMode = false;

  private readonly promiseMap = new Map<string, PendingResolver>();

  private readonly servers: string[] = (import.meta.env.VITE_CONTRACT_URLS ?? '')
    .split(',')
    .map((s: string) => s.trim())
    .filter(Boolean);

  // Mock store
  private mockTasks: Task[] = [
    {
      id: 1,
      taskId: 1,
      description: 'Task 1: Review contract requirements',
      isCompleted: false,
    },
    {
      id: 2,
      taskId: 2,
      description: 'Task 2: Mark a task as completed',
      isCompleted: false,
    },
    {
      id: 3,
      taskId: 3,
      description: 'Task 3: Query all tasks',
      isCompleted: false,
    },
  ];

  private constructor() {}

  static getInstance(): ContractService {
    if (!ContractService.instance) ContractService.instance = new ContractService();
    return ContractService.instance;
  }

  async init(): Promise<boolean> {
    const envMock = import.meta.env.VITE_MOCK_MODE === 'true';
    const missingUrls = this.servers.length === 0;
    const placeholderUrls = this.servers.some((s: string) =>
      ['example', 'your-server', 'placeholder'].some((p: string) => s.toLowerCase().includes(p)),
    );

    if (envMock || missingUrls || placeholderUrls || !HotPocket) {
      this.mockMode = true;
      console.warn(
        '[Three Tasks Dashboard] Running in MOCK MODE. Set VITE_MOCK_MODE=false and configure VITE_CONTRACT_URLS to connect to HotPocket.',
      );
      return true;
    }

    if (!this.keyPair) this.keyPair = await HotPocket.generateKeys();
    if (!this.client) this.client = await HotPocket.createClient(this.servers, this.keyPair);

    if (!this.client || typeof this.client.connect !== 'function') {
      this.mockMode = true;
      console.warn(
        '[Three Tasks Dashboard] HotPocket client not usable; falling back to MOCK MODE. Check VITE_CONTRACT_URLS and node availability.',
      );
      return true;
    }

    this.registerEvents();

    if (!this.connected) {
      const ok: boolean = await this.client.connect();
      if (!ok) {
        throw new Error(
          'Failed to connect to HotPocket servers. Check VITE_CONTRACT_URLS (wss://...) or set VITE_MOCK_MODE=true.',
        );
      }
      this.connected = true;
    }

    return true;
  }

  private registerEvents(): void {
    this.client.on(HotPocket.events.disconnect, () => {
      this.connected = false;
      window.location.reload();
    });

    this.client.on(HotPocket.events.connectionChange, (server: string, action: string) => {
      console.log(`HotPocket ${action}: ${server}`);
    });

    this.client.on(HotPocket.events.contractOutput, (r: { outputs: unknown[] }) => {
      r.outputs.forEach((output: unknown) => {
        const parsed = this.deserialize<ContractResponse>(output);
        const pId = parsed.promiseId;
        if (!pId) return;

        const pending = this.promiseMap.get(pId);
        if (!pending) return;

        if (parsed.error) pending.reject(parsed.error);
        else pending.resolve(parsed.success);

        this.promiseMap.delete(pId);
      });
    });

    this.client.on(HotPocket.events.healthEvent, (ev: unknown) => console.log(ev));
  }

  async submitContractReadRequest<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) return this.mockResponse<T>(message);

    const output = await this.client.submitContractReadRequest(this.serialize(message));
    const parsed = this.deserialize<ContractResponse<T>>(output);

    if (parsed.error) throw parsed.error;
    return (parsed.success ?? null) as T;
  }

  async submitInputToContract<T = unknown>(message: ContractMessage): Promise<T> {
    if (this.mockMode) return this.mockResponse<T>(message);

    const promiseId = this.getUniqueId();
    const result = new Promise<T>((resolve, reject) => {
      this.promiseMap.set(promiseId, { resolve: resolve as (value: any) => void, reject });
    });

    const input = await this.client.submitContractInput(this.serialize({ promiseId, ...message }));
    const status = await input.submissionStatus;

    if (status.status !== 'accepted') {
      this.promiseMap.delete(promiseId);
      throw new Error(`Ledger rejection: ${status.reason ?? 'Unknown reason'}`);
    }

    return result;
  }

  private serialize(payload: unknown): string {
    return JSON.stringify(payload);
  }

  private deserialize<T>(output: unknown): T {
    if (typeof output === 'string') {
      try {
        return JSON.parse(output) as T;
      } catch {
        return output as T;
      }
    }

    if (output instanceof Uint8Array) {
      try {
        return JSON.parse(new TextDecoder().decode(output)) as T;
      } catch {
        return output as unknown as T;
      }
    }

    if (output instanceof ArrayBuffer) {
      try {
        return JSON.parse(new TextDecoder().decode(new Uint8Array(output))) as T;
      } catch {
        return output as unknown as T;
      }
    }

    return output as T;
  }

  private getUniqueId(): string {
    const bytes = new Uint8Array(10);
    window.crypto.getRandomValues(bytes);
    return Array.from(bytes)
      .map((b: number) => b.toString(16).padStart(2, '0'))
      .join('');
  }

  private async mockResponse<T>(message: ContractMessage): Promise<T> {
    await new Promise((r: (value: unknown) => void) => setTimeout(r, 150));
    console.log('[MOCK] Contract call received:', message);

    // Tasks
    if (message.Service === 'Tasks' && message.Action === 'GetTasks') {
      return [...this.mockTasks] as unknown as T;
    }

    if (message.Service === 'Tasks' && message.Action === 'CompleteTask') {
      const data = (message.data ?? {}) as { taskId?: number };
      const taskId = Number(data.taskId);
      const idx = this.mockTasks.findIndex((t: Task) => t.taskId === taskId);
      if (idx >= 0) {
        this.mockTasks[idx] = { ...this.mockTasks[idx], isCompleted: true };
      }
      return { taskId, isCompleted: true } as unknown as T;
    }

    // Cluster
    if (message.Service === 'Cluster' && message.Action === 'GetClusterUnl') {
      const res: ClusterUnl = { unl: ['ED25519_PUBKEY_SAMPLE_1', 'ED25519_PUBKEY_SAMPLE_2'] };
      return res as unknown as T;
    }

    if (message.Service === 'Cluster' && message.Action === 'GetContractVersion') {
      const res: ContractVersion = { version: 1 };
      return res as unknown as T;
    }

    if (message.Service === 'Cluster' && message.Action === 'UpdateClusterConfig') {
      return true as unknown as T;
    }

    if (message.Service === 'Cluster' && message.Action === 'UpdateClusterDetails') {
      const data = (message.data ?? {}) as any;
      const peers = Array.isArray(data.clusterDetails)
        ? data.clusterDetails
            .map((x: any) => (x?.domain && x?.peer_port ? `${x.domain}:${x.peer_port}` : null))
            .filter(Boolean)
        : [];
      return { peers } as unknown as T;
    }

    return null as T;
  }
}
