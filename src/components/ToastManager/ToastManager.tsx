import {ReactNode, useEffect, useMemo, useState} from 'react';

import styles from './ToastManager.module.css';

type Renderer = string | (() => ReactNode);

type Toast = {
  id: number;
  renderer: Renderer;
  height?: number;
  offset?: number;
  hiding?: boolean;
  hidingTs?: number;
  clearHideTimeout?: () => void;
};

type TState = {
  toasts: Toast[];
  paused: boolean;
  pause: () => void;
  resume: () => void;
  addToast: (renderer: Renderer) => void;
  markHide: (toast: Toast) => void;
  forceUpdate: () => void;
  delayedUpdate: () => void;
  lazyCleanUpToasts: () => void;
  cleanUp: () => void;
};

type Instance = {
  show: (renderer: Renderer) => void;
};

const HIDE_TIMEOUT = 4000;
const queue: Renderer[] = [];

let instance: Instance | undefined;

export function showToast(renderer: Renderer) {
  if (instance) {
    instance.show(renderer);
  } else {
    queue.push(renderer);
  }
}

function applyPositions(state: TState) {
  const {toasts} = state;
  let totalOffset = 16;

  for (let i = toasts.length - 1; i >= 0; i--) {
    const toast = toasts[i];

    if (!toast.hiding) {
      toast.offset = totalOffset;
      totalOffset += toast.height || 0;
    }
  }
}

function createTimerManager() {
  const timers: Set<number> = new Set();

  return {
    setTimeout(callback: () => void, ms: number): () => void {
      const timerId = window.setTimeout(() => {
        timers.delete(timerId);
        callback();
      }, ms);
      timers.add(timerId);

      return () => {
        window.clearTimeout(timerId);
        timers.delete(timerId);
      };
    },
    resetAll() {
      Array.from(timers.values()).forEach(window.clearTimeout);
      timers.clear();
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
      toasts: [],
      pause() {
        state.paused = true;

        for (let i = 0; i < state.toasts.length; i++) {
          const toast = state.toasts[i];

          if (toast.clearHideTimeout) {
            toast.clearHideTimeout();
            toast.clearHideTimeout = undefined;
          }
        }
      },
      resume() {
        state.paused = false;

        for (let i = 0; i < state.toasts.length; i++) {
          const toast = state.toasts[i];

          if (!toast.hiding) {
            toast.clearHideTimeout = timer.setTimeout(() => {
              state.markHide(toast);
            }, HIDE_TIMEOUT + i * 100);
          }
        }
      },
      addToast(renderer: Renderer) {
        const toast: Toast = {
          id: ++lastId,
          renderer,
        };

        if (!state.paused) {
          toast.clearHideTimeout = timer.setTimeout(() => {
            state.markHide(toast);
          }, HIDE_TIMEOUT);
        }

        state.toasts.push(toast);

        if (state.toasts.length > 3) {
          const now = Date.now();

          for (let i = 0; i < state.toasts.length - 3; i++) {
            const toast = state.toasts[i];
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
        toast.clearHideTimeout = undefined;
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
          state.toasts = state.toasts.filter((toast) => !toast.hidingTs || toast.hidingTs > limitTs);
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

  if (!state.toasts.length) {
    return null;
  }

  return (
    <div
      className={styles.wrapper}
      onMouseEnter={state.pause}
      onMouseLeave={state.resume}
      onClick={() => {
        state.pause();
        state.resume();
      }}
    >
      {state.toasts.map((toast) => {
        const {id, renderer} = toast;
        let content: ReactNode;

        if (renderer instanceof Function) {
          content = renderer();
        } else {
          content = <div className={styles.toast}>{renderer}</div>;
        }

        return (
          <div
            key={id}
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
            {content}
          </div>
        );
      })}
    </div>
  );
}
