"use client";

import { useQuery } from "@tanstack/react-query";

import { useAppStore } from "@/shared/store/app-store";

type HealthResponse = {
  status: string;
  timestamp: string;
  services: {
    api: string;
    query: string;
    store: string;
  };
};

async function getHealth(): Promise<HealthResponse> {
  const response = await fetch("/api/health");

  if (!response.ok) {
    throw new Error("Failed to fetch application health.");
  }

  return response.json();
}

export default function AppShellDemo() {
  const count = useAppStore((state) => state.count);
  const increment = useAppStore((state) => state.increment);
  const decrement = useAppStore((state) => state.decrement);
  const reset = useAppStore((state) => state.reset);

  const healthQuery = useQuery({
    queryKey: ["health"],
    queryFn: getHealth,
  });

  return (
    <main className="min-h-screen bg-base-200">
      <section className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-8 px-6 py-10 lg:px-10">
        <div className="flex flex-col gap-4">
          <div className="badge badge-primary badge-outline w-fit">
            Next 16 starter
          </div>
          <div className="flex flex-col gap-3">
            <h1
              className="text-4xl font-semibold tracking-tight text-base-content sm:text-5xl"
              data-display="serif"
            >
              Базовая инфраструктура готова
            </h1>
            <p className="max-w-3xl text-base leading-7 text-base-content/70 sm:text-lg">
              Проект уже подключен к daisyUI, Zustand и TanStack Query. Ниже
              есть живые блоки, чтобы сразу проверить состояние клиента и
              загрузку данных через App Router.
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
          <div className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-6">
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h2 className="card-title text-2xl">TanStack Query</h2>
                  <p className="mt-2 text-sm leading-6 text-base-content/70">
                    Клиент создан в общем провайдере, а этот блок ходит в
                    локальный API-роут `/api/health`.
                  </p>
                </div>
                <button
                  className="btn btn-sm btn-ghost"
                  onClick={() => healthQuery.refetch()}
                  type="button"
                >
                  Refresh
                </button>
              </div>

              <div className="rounded-box bg-base-200 p-4">
                {healthQuery.isPending ? (
                  <div className="flex items-center gap-3 text-sm text-base-content/70">
                    <span className="loading loading-spinner loading-sm" />
                    Загрузка статуса приложения...
                  </div>
                ) : null}

                {healthQuery.isError ? (
                  <div className="alert alert-error">
                    <span>{healthQuery.error.message}</span>
                  </div>
                ) : null}

                {healthQuery.data ? (
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base-content/60">Status</span>
                      <span className="badge badge-success badge-outline">
                        {healthQuery.data.status}
                      </span>
                    </div>
                    <div className="flex items-center justify-between gap-4">
                      <span className="text-base-content/60">Timestamp</span>
                      <span className="font-mono text-xs sm:text-sm">
                        {new Date(healthQuery.data.timestamp).toLocaleString()}
                      </span>
                    </div>
                    <div className="grid gap-2 sm:grid-cols-3">
                      {Object.entries(healthQuery.data.services).map(
                        ([service, state]) => (
                          <div
                            key={service}
                            className="rounded-box border border-base-300 bg-base-100 px-3 py-2"
                          >
                            <div className="text-xs uppercase tracking-[0.2em] text-base-content/50">
                              {service}
                            </div>
                            <div className="mt-1 font-medium text-base-content">
                              {state}
                            </div>
                          </div>
                        ),
                      )}
                    </div>
                  </div>
                ) : null}
              </div>
            </div>
          </div>

          <div className="card border border-base-300 bg-base-100 shadow-sm">
            <div className="card-body gap-6">
              <div>
                <h2 className="card-title text-2xl">Zustand Store</h2>
                <p className="mt-2 text-sm leading-6 text-base-content/70">
                  Базовый store уже готов для клиентского состояния и
                  UI-флагов. Сейчас в нем поднят простой счетчик для проверки.
                </p>
              </div>

              <div className="stats stats-vertical border border-base-300 bg-base-200 shadow-none sm:stats-horizontal">
                <div className="stat">
                  <div className="stat-title">Counter value</div>
                  <div className="stat-value text-primary">{count}</div>
                  <div className="stat-desc">shared app state</div>
                </div>
              </div>

              <div className="flex flex-wrap gap-3">
                <button
                  className="btn btn-primary"
                  onClick={increment}
                  type="button"
                >
                  Increment
                </button>
                <button
                  className="btn btn-outline"
                  onClick={decrement}
                  type="button"
                >
                  Decrement
                </button>
                <button className="btn btn-ghost" onClick={reset} type="button">
                  Reset
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
