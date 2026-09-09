import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Network, RefreshCw, Plus, Minus, BadgeInfo } from 'lucide-react';
import ApiService from '../../services/api-service';
import type { RootState } from '../../app/store';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { setUnl, setVersion } from '../../features/cluster/clusterSlice';
import type { ClusterConfigAction } from '../../types';

export default function ClusterPage() {
  const dispatch = useDispatch();
  const unl = useSelector((s: RootState) => s.cluster.unl) ?? [];
  const version = useSelector((s: RootState) => s.cluster.version);

  const [pubKey, setPubKey] = useState('');
  const [action, setAction] = useState<ClusterConfigAction>('add');
  const [busy, setBusy] = useState(false);

  const sortedUnl = useMemo(() => [...unl].sort(), [unl]);

  const loadCluster = async (): Promise<void> => {
    setBusy(true);
    try {
      const [unlRes, versionRes] = await Promise.all([
        ApiService.getInstance().getClusterUnl(),
        ApiService.getInstance().getContractVersion(),
      ]);

      dispatch(setUnl(unlRes?.unl ?? []));
      dispatch(setVersion(typeof versionRes?.version === 'number' ? versionRes.version : null));
    } catch (e: unknown) {
      dispatch(
        showSnackbar({
          severity: 'error',
          message: e instanceof Error ? e.message : 'Failed to load cluster information.',
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  useEffect(() => {
    void loadCluster();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const submitUpdateUnl = async (e: React.FormEvent<HTMLFormElement>): Promise<void> => {
    e.preventDefault();

    const trimmed = pubKey.trim();
    if (!trimmed) {
      dispatch(showSnackbar({ severity: 'info', message: 'Enter a public key.' }));
      return;
    }

    setBusy(true);
    try {
      await ApiService.getInstance().updateClusterConfig({ action, publicKey: trimmed });
      dispatch(
        showSnackbar({
          severity: 'success',
          message: action === 'add' ? 'Public key added to UNL.' : 'Public key removed from UNL.',
        }),
      );
      setPubKey('');
      await loadCluster();
    } catch (err: unknown) {
      dispatch(
        showSnackbar({
          severity: 'error',
          message: err instanceof Error ? err.message : 'Failed to update UNL.',
        }),
      );
    } finally {
      setBusy(false);
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-center">
          <div className="flex items-start gap-3">
            <div className="rounded-2xl bg-indigo-50 p-3">
              <Network className="h-6 w-6 text-indigo-700" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Cluster Tools</h1>
              <p className="mt-1 text-sm text-gray-600">
                View contract version and manage UNL configuration.
              </p>
            </div>
          </div>

          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              void loadCluster();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:opacity-60"
            disabled={busy}
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 md:grid-cols-2">
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">
              Contract Version
            </div>
            <div className="mt-1 text-3xl font-bold text-gray-900">{version ?? '—'}</div>
          </div>
          <div className="rounded-2xl border border-gray-100 bg-gray-50 p-5">
            <div className="text-xs font-medium uppercase tracking-wide text-gray-400">UNL Size</div>
            <div className="mt-1 text-3xl font-bold text-gray-900">{unl.length}</div>
          </div>
        </div>

        <div className="mt-6 flex items-start gap-2 rounded-2xl bg-amber-50 p-4 text-amber-900 ring-1 ring-amber-100">
          <BadgeInfo className="mt-0.5 h-5 w-5" />
          <p className="text-sm">
            Cluster actions affect the node configuration. Use with care.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Update UNL</h2>
          <p className="mt-1 text-sm text-gray-600">Add or remove a public key.</p>

          <form onSubmit={submitUpdateUnl} className="mt-5 space-y-4">
            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Action</label>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setAction('add');
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    action === 'add'
                      ? 'border-indigo-200 bg-indigo-50 text-indigo-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
                <button
                  type="button"
                  onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                    e.preventDefault();
                    setAction('remove');
                  }}
                  className={`inline-flex items-center justify-center gap-2 rounded-xl border px-4 py-2.5 text-sm font-semibold transition ${
                    action === 'remove'
                      ? 'border-rose-200 bg-rose-50 text-rose-800'
                      : 'border-gray-200 bg-white text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Minus className="h-4 w-4" />
                  Remove
                </button>
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-sm font-medium text-gray-700">Public Key</label>
              <input
                value={pubKey}
                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPubKey(e.target.value)}
                placeholder="ED25519 public key..."
                className="w-full rounded-xl border border-gray-200 px-4 py-2.5 text-sm text-gray-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100"
              />
            </div>

            <button
              type="submit"
              disabled={busy || !pubKey.trim()}
              className="w-full rounded-xl bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {busy ? 'Submitting...' : 'Submit'}
            </button>
          </form>
        </div>

        <div className="rounded-3xl bg-white p-6 shadow-sm ring-1 ring-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Current UNL</h2>
          <p className="mt-1 text-sm text-gray-600">Keys currently in the cluster configuration.</p>

          <div className="mt-5 max-h-[340px] space-y-2 overflow-auto rounded-2xl border border-gray-100 bg-gray-50 p-3">
            {sortedUnl.length === 0 ? (
              <div className="p-4 text-sm text-gray-500">No keys found.</div>
            ) : (
              sortedUnl.map((k: string) => (
                <div
                  key={k}
                  className="rounded-xl bg-white px-4 py-3 text-sm text-gray-800 shadow-sm ring-1 ring-gray-100"
                >
                  <span className="font-mono break-all">{k}</span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
