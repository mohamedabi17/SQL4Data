import { useEffect, useState } from "react";
import { checkHealth } from "../../lib/api";

export function BackendStatus() {
  const [status, setStatus] = useState<"checking" | "connected" | "disconnected">("checking");

  useEffect(() => {
    const checkBackend = async () => {
      try {
        const health = await checkHealth();
        if (health.status === "healthy") {
          setStatus("connected");
        } else {
          setStatus("disconnected");
        }
      } catch (error) {
        setStatus("disconnected");
      }
    };

    checkBackend();
    const interval = setInterval(checkBackend, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (status === "checking") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-yellow-100 dark:bg-yellow-900/20 border border-yellow-300 dark:border-yellow-700">
        <div className="w-2 h-2 rounded-full bg-yellow-500 animate-pulse"></div>
        <span className="text-xs font-medium text-yellow-800 dark:text-yellow-300">
          Checking Backend...
        </span>
      </div>
    );
  }

  if (status === "connected") {
    return (
      <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-green-100 dark:bg-green-900/20 border border-green-300 dark:border-green-700">
        <div className="w-2 h-2 rounded-full bg-green-500"></div>
        <span className="text-xs font-medium text-green-800 dark:text-green-300">
          Powered by AI
        </span>
      </div>
    );
  }

  return (
    <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-100 dark:bg-red-900/20 border border-red-300 dark:border-red-700">
      <div className="w-2 h-2 rounded-full bg-red-500"></div>
      <span className="text-xs font-medium text-red-800 dark:text-red-300">
        Backend Offline
      </span>
    </div>
  );
}
