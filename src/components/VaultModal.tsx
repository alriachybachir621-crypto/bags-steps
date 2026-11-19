import { useEffect, useState } from 'react';
import {
  browserLocalPersistence,
  createUserWithEmailAndPassword,
  setPersistence,
  signInWithEmailAndPassword,
} from 'firebase/auth';
import { Delete, Lock, X } from 'lucide-react';
import { ADMIN_EMAIL, auth, PASSCODE_SUFFIX } from '../lib/firebase';
import { Lang } from '../types/boutique';
import { getCopy } from '../data/translations';

const ATTEMPTS_KEY = 'bs_pin_attempts';
const LOCK_UNTIL_KEY = 'bs_pin_lock_until';
const MAX_ATTEMPTS = 5;
const LOCK_MS = 5 * 60 * 1000;

interface VaultModalProps {
  open: boolean;
  onClose: () => void;
  lang: Lang;
  pinConfigured: boolean;
  onAuthenticated: (isFirstSetup: boolean) => Promise<void> | void;
}

export function VaultModal({
  open,
  onClose,
  lang,
  pinConfigured,
  onAuthenticated,
}: VaultModalProps) {
  const t = getCopy(lang);
  const [pin, setPin] = useState('');
  const [setupFirstPin, setSetupFirstPin] = useState<string | null>(null);
  const [accountExistsOverride, setAccountExistsOverride] = useState(false);
  const [error, setError] = useState('');
  const [authDisabledError, setAuthDisabledError] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [attempts, setAttempts] = useState<number>(() => {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    return raw ? Number(raw) || 0 : 0;
  });
  const [lockUntil, setLockUntil] = useState<number>(() => {
    const raw = localStorage.getItem(LOCK_UNTIL_KEY);
    return raw ? Number(raw) || 0 : 0;
  });
  const [now, setNow] = useState(Date.now());

  const isSetupMode = !pinConfigured && !accountExistsOverride;
  const remainingLockMs = Math.max(0, lockUntil - now);
  const isLocked = remainingLockMs > 0;

  useEffect(() => {
    if (!open) {
      setPin('');
      setSetupFirstPin(null);
      setError('');
      setAuthDisabledError(false);
      return;
    }
    setNow(Date.now());
  }, [open]);

  useEffect(() => {
    if (!isLocked) return;
    const interval = setInterval(() => {
      const current = Date.now();
      setNow(current);
      if (current >= lockUntil) {
        setLockUntil(0);
        setAttempts(0);
        localStorage.removeItem(LOCK_UNTIL_KEY);
        localStorage.removeItem(ATTEMPTS_KEY);
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [isLocked, lockUntil]);

  if (!open) return null;

  const formatCountdown = (ms: number) => {
    const totalSec = Math.ceil(ms / 1000);
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleCompletePin = async (entered: string) => {
    if (submitting || isLocked) return;
    setError('');
    setAuthDisabledError(false);

    if (isSetupMode) {
      if (!setupFirstPin) {
        setSetupFirstPin(entered);
        setPin('');
        return;
      }
      if (setupFirstPin !== entered) {
        setSetupFirstPin(null);
        setPin('');
        setError(t.vault.mismatchCode);
        return;
      }

      setSubmitting(true);
      try {
        await setPersistence(auth, browserLocalPersistence);
        await createUserWithEmailAndPassword(
          auth,
          ADMIN_EMAIL,
          entered + PASSCODE_SUFFIX
        );
        localStorage.removeItem(ATTEMPTS_KEY);
        localStorage.removeItem(LOCK_UNTIL_KEY);
        await onAuthenticated(true);
      } catch (err: unknown) {
        const code =
          typeof err === 'object' && err && 'code' in err
            ? String((err as { code: string }).code)
            : '';
        if (code === 'auth/email-already-in-use') {
          setAccountExistsOverride(true);
          setSetupFirstPin(null);
          setPin('');
          setError(t.vault.wrongCode);
        } else if (code === 'auth/operation-not-allowed') {
          setAuthDisabledError(true);
          setSetupFirstPin(null);
          setPin('');
        } else {
          setSetupFirstPin(null);
          setPin('');
          setError(t.vault.wrongCode);
        }
      } finally {
        setSubmitting(false);
      }
      return;
    }

    // Standard login mode
    setSubmitting(true);
    try {
      await setPersistence(auth, browserLocalPersistence);
      await signInWithEmailAndPassword(
        auth,
        ADMIN_EMAIL,
        entered + PASSCODE_SUFFIX
      );
      setAttempts(0);
      setLockUntil(0);
      localStorage.removeItem(ATTEMPTS_KEY);
      localStorage.removeItem(LOCK_UNTIL_KEY);
      await onAuthenticated(false);
    } catch (err: unknown) {
      const code =
        typeof err === 'object' && err && 'code' in err
          ? String((err as { code: string }).code)
          : '';
      if (code === 'auth/operation-not-allowed') {
        setAuthDisabledError(true);
        setPin('');
      } else {
        const nextAttempts = attempts + 1;
        setAttempts(nextAttempts);
        localStorage.setItem(ATTEMPTS_KEY, String(nextAttempts));
        setPin('');
        if (nextAttempts >= MAX_ATTEMPTS) {
          const until = Date.now() + LOCK_MS;
          setLockUntil(until);
          setNow(Date.now());
          localStorage.setItem(LOCK_UNTIL_KEY, String(until));
        } else {
          setError(t.vault.wrongCode);
        }
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleDigit = (digit: string) => {
    if (submitting || isLocked || pin.length >= 4) return;
    const next = pin + digit;
    setPin(next);
    setError('');
    if (next.length === 4) {
      void handleCompletePin(next);
    }
  };

  const handleBackspace = () => {
    if (submitting || isLocked) return;
    setPin((prev) => prev.slice(0, -1));
    setError('');
  };

  const handleClear = () => {
    if (submitting || isLocked) return;
    setPin('');
    setError('');
  };

  return (
    <div
      className="fixed inset-0 z-50 bg-[#2A1A20]/60 backdrop-blur-xs flex items-center justify-center p-4"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
    >
      <div
        className="w-full max-w-sm bg-[#FAF4EE] rounded-3xl p-6 sm:p-8 shadow-2xl border border-[#2A1A20]/10 relative"
        onClick={(e) => e.stopPropagation()}
        dir="ltr"
      >
        <button
          type="button"
          onClick={onClose}
          aria-label={t.vault.cancel}
          className="absolute top-4 right-4 w-9 h-9 rounded-full hover:bg-[#F6DDE5]/70 flex items-center justify-center text-[#2A1A20] cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center space-y-2 mb-6 pt-2">
          <div className="w-12 h-12 mx-auto rounded-full bg-[#F6DDE5] text-[#6B1238] flex items-center justify-center">
            <Lock className="w-5 h-5" />
          </div>
          <h2 className="font-serif-editorial text-2xl font-semibold text-[#2A1A20]">
            {isLocked
              ? t.vault.lockedTitle
              : isSetupMode
                ? t.vault.setupTitle
                : t.vault.enterCode}
          </h2>
          {isSetupMode && !isLocked && (
            <p className="text-xs text-[#5B454D]">
              {setupFirstPin ? t.vault.confirmSubtitle : t.vault.setupSubtitle}
            </p>
          )}
        </div>

        {isLocked ? (
          <div className="bg-white rounded-2xl p-6 text-center space-y-3 border border-[#6B1238]/20">
            <p className="text-sm text-[#5B454D]">{t.vault.lockedMessage}</p>
            <p className="text-3xl font-semibold text-[#6B1238] tabular-nums">
              {formatCountdown(remainingLockMs)}
            </p>
          </div>
        ) : (
          <>
            {/* 4-dot indicator */}
            <div className="flex items-center justify-center gap-4 mb-5">
              {[0, 1, 2, 3].map((idx) => (
                <span
                  key={idx}
                  className={`w-3.5 h-3.5 rounded-full border transition-all ${
                    idx < pin.length
                      ? 'bg-[#6B1238] border-[#6B1238] scale-110'
                      : 'bg-white border-[#2A1A20]/25'
                  }`}
                />
              ))}
            </div>

            {error && (
              <p
                className="text-center text-xs font-semibold text-[#6B1238] mb-4"
                role="alert"
              >
                {error} ({MAX_ATTEMPTS - attempts} {t.vault.attemptsLeft})
              </p>
            )}

            {authDisabledError && (
              <div className="mb-4 p-3 rounded-xl bg-white border border-[#6B1238]/25 text-xs text-[#2A1A20] leading-relaxed">
                {t.vault.authDisabledHelp}
              </div>
            )}

            {/* Numeric PIN Pad */}
            <div className="grid grid-cols-3 gap-3">
              {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                <button
                  key={digit}
                  type="button"
                  disabled={submitting}
                  onClick={() => handleDigit(digit)}
                  className="h-14 rounded-2xl bg-white border border-[#2A1A20]/10 text-lg font-semibold text-[#2A1A20] hover:bg-[#F6DDE5]/50 active:scale-95 transition-all tabular-nums shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  {digit}
                </button>
              ))}

              <button
                type="button"
                disabled={submitting}
                onClick={handleClear}
                className="h-14 rounded-2xl bg-white/70 border border-[#2A1A20]/10 text-xs font-medium text-[#6E5760] hover:bg-[#F6DDE5]/40 cursor-pointer"
              >
                {t.vault.clear}
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={() => handleDigit('0')}
                className="h-14 rounded-2xl bg-white border border-[#2A1A20]/10 text-lg font-semibold text-[#2A1A20] hover:bg-[#F6DDE5]/50 active:scale-95 transition-all tabular-nums shadow-2xs cursor-pointer disabled:opacity-50"
              >
                0
              </button>

              <button
                type="button"
                disabled={submitting}
                onClick={handleBackspace}
                aria-label="Backspace"
                className="h-14 rounded-2xl bg-white/70 border border-[#2A1A20]/10 flex items-center justify-center text-[#2A1A20] hover:bg-[#F6DDE5]/40 cursor-pointer"
              >
                <Delete className="w-5 h-5" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
