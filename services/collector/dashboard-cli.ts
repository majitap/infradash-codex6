import { mkdir, writeFile, rename } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { collectDashboard } from "./dashboard";
async function main() {
  const snapshot = await collectDashboard({
    baseUrl: process.env.GITLAB_BASE_URL ?? "",
    token: process.env.GITLAB_READ_TOKEN ?? "",
    projectIds: (process.env.GITLAB_PROJECT_IDS ?? "")
      .split(",")
      .map((v) => v.trim())
      .filter(Boolean),
    workspace: process.env.DASHBOARD_WORKSPACE ?? "우리 팀",
    licenseToken: process.env.GITLAB_LICENSE_READ_TOKEN || undefined,
  });
  const destination = resolve(".local/dashboard-live.json");
  await mkdir(dirname(destination), { recursive: true });
  await writeFile(destination + ".tmp", JSON.stringify(snapshot, null, 2), {
    mode: 0o600,
  });
  await rename(destination + ".tmp", destination);
  console.log(
    "수집 완료: .local/dashboard-live.json · 대시보드의 데이터 연결에서 가져오세요.",
  );
}
main().catch(() => {
  console.error(
    "수집하지 못했습니다. 깃랩 주소, 토큰, 프로젝트 조회 권한과 네트워크를 확인하세요. 기존 파일은 변경하지 않았습니다.",
  );
  process.exitCode = 1;
});
