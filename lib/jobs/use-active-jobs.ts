"use client";

import { useSyncExternalStore, useCallback } from "react";
import { getActiveJobsStore, type ActiveJob } from "./active-jobs-store";

/**
 * React hook to subscribe to the global active jobs store.
 */
export function useActiveJobs() {
  const store = getActiveJobsStore();

  const getSnapshot = useCallback(() => store.getAll(), [store]);
  const subscribe = useCallback((cb: () => void) => store.subscribe(cb), [store]);

  const jobs = useSyncExternalStore(subscribe, getSnapshot, () => []);

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
