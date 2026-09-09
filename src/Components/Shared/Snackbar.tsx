import { useDispatch, useSelector } from 'react-redux';
import { CircleAlert, CircleCheck, Info, X } from 'lucide-react';
import type { RootState } from '../../app/store';
import { hideSnackbar, type SnackbarSeverity } from '../../features/snackbar/snackbarSlice';

const ICONS: Record<SnackbarSeverity, typeof Info> = {
  success: CircleCheck,
  error: CircleAlert,
  info: Info,
};

const COLORS: Record<SnackbarSeverity, string> = {
  success: 'bg-emerald-600',
  error: 'bg-rose-600',
  info: 'bg-indigo-600',
};

export default function Snackbar() {
  const dispatch = useDispatch();

  const { open, message, severity } = useSelector(
    (state: RootState) => state.snackbar,
  ) as { open: boolean; message: string; severity: SnackbarSeverity };

  if (!open) return null;

  const Icon = ICONS[severity];

  return (
    <div
      className={`fixed bottom-6 right-6 flex max-w-[min(520px,calc(100vw-2rem))] items-center gap-3 rounded-lg px-4 py-3 text-white shadow-lg ${
        COLORS[severity]
      }`}
    >
      <Icon className="h-5 w-5 shrink-0" />
      <span className="text-sm leading-snug">{message}</span>
      <button
        onClick={() => dispatch(hideSnackbar())}
        className="ml-2 rounded-md p-1 hover:bg-white/15"
        aria-label="Dismiss"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );
}
