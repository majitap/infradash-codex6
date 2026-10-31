"use client";
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from "react";
import {
  dashboardSchema,
  demoDashboard,
  snapshotStale,
  validateDataUrl,
  type DashboardSnapshot,
} from "@/lib/dashboard";

type DashboardContext = {
  data: DashboardSnapshot | null;
  source: "demo" | "file" | "api";
  endpoint: string;
  error: string | null;
  loading: boolean;
  stale: boolean;
  importFile: (file: File) => Promise<void>;
  connect: (url: string) => void;
  useDemo: () => void;
  refresh: () => Promise<void>;
};
const Context = createContext<DashboardContext | null>(null);
export function useDashboard() {
  const value = useContext(Context);
  if (!value) throw new Error("대시보드 공급자가 필요합니다.");
  return value;
}
export function DashboardProvider({ children }: { children: React.ReactNode }) {
  const initialUrl = process.env.NEXT_PUBLIC_DASHBOARD_URL ?? "";
  const [endpoint, setEndpoint] = useState(initialUrl);
  const [revision, setRevision] = useState(0);
  const [source, setSource] = useState<DashboardContext["source"]>(
    initialUrl ? "api" : "demo",
  );
  const [data, setData] = useState<DashboardSnapshot | null>(
    initialUrl ? null : demoDashboard,
  );
  const [loading, setLoading] = useState(false),
    [error, setError] = useState<string | null>(null),
    [now, setNow] = useState(0);
  const request = useRef<AbortController | null>(null);
  const refresh = useCallback(async () => {
    if (!endpoint || source !== "api") return;
    request.current?.abort();
    const controller = new AbortController();
    request.current = controller;
    const timeout = setTimeout(() => controller.abort(), 12000);
    setLoading(true);
    try {
      const response = await fetch(validateDataUrl(endpoint), {
        credentials: "include",
        cache: "no-store",
        redirect: "error",
        signal: controller.signal,
        headers: { Accept: "application/json" },
      });
      if (!response.ok)
        throw new Error(
          response.status === 401 || response.status === 403
            ? "로그인 또는 조회 권한을 확인하세요."
            : `데이터 조회에 실패했습니다. 응답 코드 ${response.status}`,
        );
      const body = await response.text();
      if (body.length > 2_000_000)
        throw new Error("데이터는 2메가바이트 이하여야 합니다.");
      const result = dashboardSchema.safeParse(JSON.parse(body));
      if (!result.success)
        throw new Error(
          "데이터 형식이 맞지 않습니다. 연결 가이드의 형식을 확인하세요.",
        );
      if (request.current !== controller) return;
      setData(result.data);
      setError(null);
      setNow(Date.now());
    } catch (e) {
      if (request.current === controller)
        setError(
          e instanceof SyntaxError
            ? "응답이 올바른 데이터 파일 형식이 아닙니다."
            : e instanceof TypeError ||
                (e instanceof Error && e.name === "AbortError")
              ? "수집 주소에 연결하지 못했습니다. 주소와 네트워크를 확인하세요."
              : e instanceof Error
                ? e.message
                : "수집 주소에 연결하지 못했습니다.",
        );
    } finally {
      clearTimeout(timeout);
      if (request.current === controller) {
        request.current = null;
        setLoading(false);
      }
    }
  }, [endpoint, source]);
  useEffect(() => {
    const first = setTimeout(() => void refresh(), 0);
    const poll = setInterval(() => void refresh(), 30000);
    return () => {
      clearTimeout(first);
      clearInterval(poll);
      request.current?.abort();
      request.current = null;
    };
  }, [refresh, revision]);
  useEffect(() => {
    const tick = setInterval(() => setNow(Date.now()), 5000);
    return () => clearInterval(tick);
  }, []);
  function reset() {
    request.current?.abort();
    request.current = null;
    setLoading(false);
    setError(null);
  }
  async function importFile(file: File) {
    if (file.size > 2_000_000)
      throw new Error("데이터 파일은 2메가바이트 이하여야 합니다.");
    let value: unknown;
    try {
      value = JSON.parse(await file.text());
    } catch {
      throw new Error(
        "파일을 읽지 못했습니다. 올바른 데이터 파일인지 확인하세요.",
      );
    }
    const parsed = dashboardSchema.safeParse(value);
    if (!parsed.success)
      throw new Error(
        `데이터 형식을 확인하세요: ${parsed.error.issues[0]?.path.join(".") ?? "파일"}`,
      );
    reset();
    setEndpoint("");
    setSource("file");
    setData(parsed.data);
    setNow(Date.now());
  }
  function connect(url: string) {
    const validated = validateDataUrl(url);
    reset();
    setData(null);
    setSource("api");
    setEndpoint(validated);
    setRevision((v) => v + 1);
  }
  function useDemo() {
    reset();
    setEndpoint("");
    setSource("demo");
    setData(demoDashboard);
  }
  return (
    <Context.Provider
      value={{
        data,
        source,
        endpoint,
        error,
        loading,
        stale: !!data && snapshotStale(data, now),
        importFile,
        connect,
        useDemo,
        refresh,
      }}
    >
      {children}
    </Context.Provider>
  );
}
