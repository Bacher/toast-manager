import {useEffect, useMemo, useState} from 'react';

import styles from './ToastManager.module.css';

type Toast = {
  id: number;
  text: string;
  height?: number;
  offset?: number;
  hiding?: boolean;
  hidingTs?: number;
  hideTimeout?: number;
};

type TState = {
  lines: Toast[];
  paused: boolean;
  pause: () => void;
  resume: () => void;
  addToast: (t: string) => void;
  markHide: (t: Toast) => void;
  forceUpdate: () => void;
  delayedUpdate: () => void;
  lazyCleanUpToasts: () => void;
  cleanUp: () => void;
};

const HIDE_TIMEOUT = 3000;
const queue: string[] = [];
let instance: {show: (p: string) => void} | undefined;

export function showToast(text: string) {
  if (instance) {
    instance.show(text);
  } else {
    queue.push(text);
  }
}

function applyPositions(state: TState) {
  const {lines} = state;
  let totalOffset = 0;

  for (let i = lines.length - 1; i >= 0; i--) {
    const toast = lines[i];

    if (!toast.hiding) {
      toast.offset = totalOffset;
      totalOffset += toast.height || 0;
    }
  }
}

function createTimerManager() {
  const timers: Set<number> = new Set();

  return {
    setTimeout(callback: () => void, ms: number): number {
      const timerId = window.setTimeout(() => {
        timers.delete(timerId);
        callback();
      }, ms);
      timers.add(timerId);
      return timerId;
    },
    clearTimeout(timerId: number) {
      window.clearTimeout(timerId);
      timers.delete(timerId);
    },
    resetAll() {
      Array.from(timers.values()).forEach(window.clearTimeout);
    },
  };
}

export function ToastManager() {
  const [, setRender] = useState(0);
  const state = useMemo<TState>(() => {
    let isDelayedUpdate = false;
    let renderId = 0;
    let lastId = 0;

    const timer = createTimerManager();

    return {
      paused: false,
      lines: [],
      pause() {
        state.paused = true;

        for (let i = 0; i < state.lines.length; i++) {
          const toast = state.lines[i];

          if (toast.hideTimeout) {
            timer.clearTimeout(toast.hideTimeout);
            toast.hideTimeout = undefined;
          }
        }
      },
      resume() {
        state.paused = false;

        for (let i = 0; i < state.lines.length; i++) {
          const toast = state.lines[i];

          if (!toast.hiding) {
            toast.hideTimeout = timer.setTimeout(() => {
              state.markHide(toast);
            }, HIDE_TIMEOUT + i * 100);
          }
        }
      },
      addToast(text: string) {
        const toast: Toast = {
          id: ++lastId,
          text,
        };

        if (!state.paused) {
          toast.hideTimeout = timer.setTimeout(() => {
            state.markHide(toast);
          }, HIDE_TIMEOUT);
        }

        state.lines.push(toast);

        if (state.lines.length > 3) {
          const now = Date.now();

          for (let i = 0; i < state.lines.length - 3; i++) {
            const toast = state.lines[i];
            if (!toast.hiding) {
              toast.hiding = true;
              toast.hidingTs = now;
            }
          }

          state.lazyCleanUpToasts();
        }

        state.forceUpdate();
      },
      markHide(toast: Toast) {
        toast.hideTimeout = undefined;
        toast.hiding = true;
        toast.hidingTs = Date.now();
        state.forceUpdate();
        state.lazyCleanUpToasts();
      },
      forceUpdate() {
        setRender(++renderId);
      },
      delayedUpdate() {
        if (!isDelayedUpdate) {
          isDelayedUpdate = true;
          timer.setTimeout(() => {
            isDelayedUpdate = false;
            state.forceUpdate();
          }, 0);
        }
      },
      lazyCleanUpToasts() {
        timer.setTimeout(() => {
          const limitTs = Date.now() - 700;
          state.lines = state.lines.filter((toast) => !toast.hidingTs || toast.hidingTs > limitTs);
          state.forceUpdate();
        }, 1000);
      },
      cleanUp() {
        timer.resetAll();
      },
    };
  }, []);

  useEffect(() => {
    instance = {
      show: (text) => {
        state.addToast(text);
      },
    };

    if (queue.length) {
      for (let i = 0; i < queue.length; i++) {
        instance.show(queue[i]);
      }
      queue.length = 0;
    }

    return () => {
      state.cleanUp();
      instance = undefined;
    };
  }, []);

  applyPositions(state);

  return (
    <div className={styles.wrapper} onMouseEnter={state.pause} onMouseLeave={state.resume}>
      {state.lines.map((toast) => (
        <div
          key={toast.id}
          ref={(el) => {
            if (el) {
              const height = el.offsetHeight;

              if (toast.height !== height) {
                toast.height = height;
                state.delayedUpdate();
              }
            }
          }}
          className={styles.toastWrapper}
          style={{
            bottom: toast.offset,
          }}
          data-hide={toast.hiding || undefined}
        >
          <div className={styles.toast}>{toast.text}</div>
        </div>
      ))}
    </div>
  );
}
