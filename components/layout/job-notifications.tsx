"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useActiveJobs } from "@/lib/jobs/use-active-jobs";
import { AGENT_CONFIGS } from "@/lib/chat/agent-configs";

type Notification = {
  id: string;
  agentType: string;
  title: string;
  status: "completed" | "failed";
};

export function JobNotifications() {
  const pathname = usePathname();
  const { jobs } = useActiveJobs();
  const [dismissedIds, setDismissedIds] = useState<Set<string>>(new Set());

  // Las notificaciones se derivan de los jobs en el render: no hay que
  // copiarlas a un estado propio desde un efecto. Lo único que guardamos es
  // cuáles ya cerró ella (a mano o por el temporizador de 8 segundos).
  const notifications = useMemo<Notification[]>(
    () =>
      jobs
        .filter((job) => job.status !== "running")
        .filter((job) => !dismissedIds.has(job.jobId))
        // Solo avisamos si NO estamos en la página del agente
        .filter((job) => pathname !== `/${job.agentType}`)
        .map((job) => ({
          id: job.jobId,
          agentType: job.agentType,
          title: AGENT_CONFIGS[job.agentType]?.title || job.agentType,
          status: job.status as "completed" | "failed",
        })),
    [jobs, pathname, dismissedIds]
  );

  const dismiss = (id: string) => {
    setDismissedIds((prev) => new Set(prev).add(id));
  };

  // Auto-dismiss after 8 seconds
  const oldestId = notifications[0]?.id;
  useEffect(() => {
    if (!oldestId) return;
    const timer = setTimeout(() => {
      setDismissedIds((prev) => new Set(prev).add(oldestId));
    }, 8000);
    return () => clearTimeout(timer);
  }, [oldestId]);

  if (notifications.length === 0) return null;

  return (
    <div className="fixed top-6 right-6 z-50 flex flex-col gap-3" style={{ fontFamily: "'Inter', sans-serif" }}>
      {notifications.map((n) => (
        <div
          key={n.id}
          className="flex items-center gap-4 px-5 py-4 rounded-2xl glass-panel border border-[#D4AF37]/30 shadow-[0_0_30px_rgba(212,175,55,0.15)] animate-[slide-in-right_0.3s_ease-out] max-w-sm"
        >
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            n.status === "completed"
              ? "bg-[#D4AF37]/15 border border-[#D4AF37]/30"
              : "bg-red-500/15 border border-red-500/30"
          }`}>
            <span
              className={`material-symbols-outlined ${
                n.status === "completed" ? "text-[#D4AF37]" : "text-red-400"
              }`}
              style={{ fontVariationSettings: "'FILL' 1" }}
            >
              {n.status === "completed" ? "check_circle" : "error"}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-white truncate">{n.title}</p>
            <p className={`text-xs ${n.status === "completed" ? "text-[#D4AF37]/70" : "text-red-400/70"}`}>
              {n.status === "completed" ? "Listo — haz click para ver" : "Error en la ejecución"}
            </p>
          </div>
          <div className="flex items-center gap-2">
            {n.status === "completed" && (
              <Link
                href={`/${n.agentType}`}
                className="text-xs font-bold text-[#D4AF37] hover:text-[#FFD700] transition-colors"
                onClick={() => dismiss(n.id)}
              >
                Ver
              </Link>
            )}
            <button
              onClick={() => dismiss(n.id)}
              className="text-gray-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined text-sm">close</span>
            </button>
          </div>
        </div>
      ))}
    </div>
  );
}
