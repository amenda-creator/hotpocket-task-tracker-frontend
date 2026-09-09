import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { CheckCircle2, Circle, ListChecks, RefreshCw } from 'lucide-react';
import type { RootState } from '../../app/store';
import ApiService from '../../services/api-service';
import Loading from '../Shared/Loading';
import { showSnackbar } from '../../features/snackbar/snackbarSlice';
import { setLoading, setTasks } from '../../features/tasks/tasksSlice';
import type { Task } from '../../types';

export default function TasksPage() {
  const dispatch = useDispatch();
  const tasks = useSelector((s: RootState) => s.tasks.items) ?? [];
  const loading = useSelector((s: RootState) => s.tasks.loading);
  const [completing, setCompleting] = useState<Record<number, boolean>>({});

  const stats = useMemo(() => {
    const total = tasks.length;
    const completed = tasks.filter((t: Task) => t.isCompleted).length;
    return {
      total,
      completed,
      pending: Math.max(0, total - completed),
    };
  }, [tasks]);

  const loadTasks = async (): Promise<void> => {
    dispatch(setLoading(true));
    try {
      const res = await ApiService.getInstance().getTasks();
      dispatch(setTasks(res));
    } catch (e: unknown) {
      dispatch(
        showSnackbar({
          severity: 'error',
          message: e instanceof Error ? e.message : 'Failed to load tasks.',
        }),
      );
    } finally {
      dispatch(setLoading(false));
    }
  };

  useEffect(() => {
    void loadTasks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const onComplete = async (taskId: number): Promise<void> => {
    setCompleting((prev: Record<number, boolean>) => ({ ...prev, [taskId]: true }));

    try {
      await ApiService.getInstance().completeTask(taskId);
      dispatch(showSnackbar({ severity: 'success', message: `Task ${taskId} completed.` }));
      await loadTasks();
    } catch (e: unknown) {
      dispatch(
        showSnackbar({
          severity: 'error',
          message: e instanceof Error ? e.message : 'Failed to complete task.',
        }),
      );
    } finally {
      setCompleting((prev: Record<number, boolean>) => ({ ...prev, [taskId]: false }));
    }
  };

  if (loading) return <Loading text="Loading tasks..." />;

  return (
    <div className="mx-auto max-w-5xl px-4 py-8">
      <div className="mb-8 rounded-3xl bg-gradient-to-r from-indigo-600 to-violet-600 p-8 text-white shadow-lg">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-center">
          <div>
            <h1 className="text-3xl font-bold">Your Three Tasks</h1>
            <p className="mt-2 text-white/80">
              This contract maintains a fixed list of three tasks. Mark any task as completed and the
              UI will update once consensus confirms it.
            </p>
          </div>
          <button
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
              e.preventDefault();
              void loadTasks();
            }}
            className="inline-flex items-center justify-center gap-2 rounded-2xl bg-white/10 px-5 py-3 text-sm font-semibold text-white ring-1 ring-white/20 transition hover:bg-white/15 active:scale-95"
          >
            <RefreshCw className="h-4 w-4" />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 grid grid-cols-1 gap-4 md:grid-cols-3">
        <div className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-gray-400">Total</p>
          <p className="mt-1 text-3xl font-bold text-gray-900">{stats.total}</p>
        </div>
        <div className="rounded-2xl border border-amber-100 bg-amber-50 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-amber-600">Pending</p>
          <p className="mt-1 text-3xl font-bold text-amber-800">{stats.pending}</p>
        </div>
        <div className="rounded-2xl border border-emerald-100 bg-emerald-50 p-5 shadow-sm">
          <p className="text-xs font-medium uppercase tracking-wide text-emerald-600">Completed</p>
          <p className="mt-1 text-3xl font-bold text-emerald-800">{stats.completed}</p>
        </div>
      </div>

      {tasks.length === 0 ? (
        <div className="flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-gray-200 bg-white py-20">
          <div className="mb-4 rounded-full bg-gray-100 p-5">
            <ListChecks className="h-8 w-8 text-gray-400" />
          </div>
          <p className="text-lg font-semibold text-gray-800">No tasks returned</p>
          <p className="mt-1 text-sm text-gray-500">Try refreshing or check contract connectivity.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {tasks.map((t: Task) => {
            const isBusy = !!completing[t.taskId];
            return (
              <div
                key={t.id}
                className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-white p-5 shadow-sm transition hover:shadow-md md:flex-row md:items-center md:justify-between"
              >
                <div className="flex items-start gap-3">
                  {t.isCompleted ? (
                    <CheckCircle2 className="mt-0.5 h-6 w-6 text-emerald-500" />
                  ) : (
                    <Circle className="mt-0.5 h-6 w-6 text-gray-300" />
                  )}

                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-semibold text-gray-900">Task {t.taskId}</span>
                      <span
                        className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${
                          t.isCompleted
                            ? 'bg-emerald-50 text-emerald-700'
                            : 'bg-amber-50 text-amber-800'
                        }`}
                      >
                        {t.isCompleted ? 'Completed' : 'Pending'}
                      </span>
                    </div>
                    <p className={`mt-1 text-sm ${t.isCompleted ? 'text-gray-400' : 'text-gray-600'}`}>
                      {t.description}
                    </p>
                  </div>
                </div>

                {!t.isCompleted ? (
                  <button
                    onClick={(e: React.MouseEvent<HTMLButtonElement>) => {
                      e.preventDefault();
                      void onComplete(t.taskId);
                    }}
                    disabled={isBusy}
                    className="inline-flex items-center justify-center rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-60 active:scale-95"
                  >
                    {isBusy ? 'Completing...' : 'Complete'}
                  </button>
                ) : (
                  <div className="text-sm font-medium text-emerald-700">Done</div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
