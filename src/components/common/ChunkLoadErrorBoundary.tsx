import React from "react";

const CHUNK_RELOAD_KEY = "alrais:chunk-reload-attempted";
const CHUNK_RELOAD_PARAM = "__alrais_reload";
const CHUNK_RELOAD_RETRY_WINDOW_MS = 60_000;

function isChunkLoadError(error: unknown): boolean {
  const message =
    error instanceof Error ? error.message : String(error ?? "");

  return /failed to fetch dynamically imported module|importing a module script failed|chunkloaderror|loading chunk|failed to load module script/i.test(
    message,
  );
}

type ChunkLoadErrorBoundaryState = {
  hasError: boolean;
};

type ChunkLoadErrorBoundaryProps = {
  children: React.ReactNode;
};

export default class ChunkLoadErrorBoundary extends React.Component<
  ChunkLoadErrorBoundaryProps,
  ChunkLoadErrorBoundaryState
> {
  state: ChunkLoadErrorBoundaryState = {
    hasError: false,
  };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    if (!isChunkLoadError(error)) return;

    const lastRetryAt = Number(sessionStorage.getItem(CHUNK_RELOAD_KEY) || 0);
    const alreadyRetried =
      Number.isFinite(lastRetryAt) &&
      Date.now() - lastRetryAt < CHUNK_RELOAD_RETRY_WINDOW_MS;
    if (alreadyRetried) return;

    sessionStorage.setItem(CHUNK_RELOAD_KEY, String(Date.now()));

    const url = new URL(window.location.href);
    url.searchParams.set(CHUNK_RELOAD_PARAM, String(Date.now()));
    window.location.replace(url.toString());
  }

  render() {
    if (!this.state.hasError) {
      return this.props.children;
    }

    return (
      <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
        <h1 className="text-[20px] font-semibold text-[#0A0C0F]">
          We updated the app
        </h1>
        <p className="mt-2 max-w-[420px] text-[14px] leading-6 text-[#3D495C]">
          Please refresh once to load the latest version.
        </p>
        <button
          type="button"
          className="mt-5 rounded-full bg-[#2351A3] px-6 py-3 text-[16px] font-semibold text-white"
          onClick={() => window.location.reload()}
        >
          Refresh
        </button>
      </div>
    );
  }
}
