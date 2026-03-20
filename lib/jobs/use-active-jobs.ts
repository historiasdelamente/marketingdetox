"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";
import { getActiveJobsStore, type ActiveJob } from "./active-jobs-store";

const EMPTY: ActiveJob[] = [];

/**
 * React hook to subscribe to the global active jobs store.
 */
export function useActiveJobs() {
  const store = getActiveJobsStore();
  const cacheRef = useRef<ActiveJob[]>(EMPTY);

  const subscribe = useCallback((cb: () => void) => store.subscribe(cb), [store]);

  const getSnapshot = useCallback(() => {
    const current = store.getAll();
    // Only return a new reference if the data actually changed
    if (
      current.length !== cacheRef.current.length ||
      current.some((j, i) => {
        const prev = cacheRef.current[i];
        return !prev || j.jobId !== prev.jobId || j.status !== prev.status || j.progress !== prev.progress || j.step !== prev.step;
      })
    ) {
      cacheRef.current = current;
    }
    return cacheRef.current;
  }, [store]);

  const jobs = useSyncExternalStore(subscribe, getSnapshot, () => EMPTY);

  return {
    jobs,
    runningJobs: jobs.filter((j) => j.status === "running"),
    startJob: (jobId: string, agentType: string) => store.startJob(jobId, agentType),
    getByAgent: (agentType: string) => store.getByAgent(agentType),
    consumeCompleted: (jobId: string) => store.consumeCompleted(jobId),
    clearJob: (jobId: string) => store.clearJob(jobId),
  };
}

export type { ActiveJob };
