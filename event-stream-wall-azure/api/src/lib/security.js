import { timingSafeEqual } from "node:crypto";

function safeEqual(actual, expected) {
  const first = Buffer.from(actual || "", "utf8");
  const second = Buffer.from(expected || "", "utf8");
  if (!first.length || first.length !== second.length) return false;
  return timingSafeEqual(first, second);
}

export function hasIntakeAccess(request) {
  return safeEqual(request.headers.get("x-forms-intake-secret"), process.env.FORMS_INTAKE_SECRET);
}

export function hasReportAccess(request) {
  return safeEqual(request.headers.get("x-report-access-code"), process.env.REPORT_ACCESS_CODE);
}
