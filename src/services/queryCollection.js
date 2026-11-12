/**
 * Pure in-memory query engine shared by every mock-backed admin service.
 * The real API accepts the same params (q/status/sort/page/limit), so pages do
 * not change when the data source is swapped.
 */

function getFieldValue(row, path) {
  return path
    .split(".")
    .reduce((acc, key) => (acc == null ? acc : acc[key]), row);
}

function matchesSearch(row, fields, term) {
  if (!term) return true;
  return fields.some((field) =>
    String(getFieldValue(row, field) ?? "")
      .toLowerCase()
      .includes(term),
  );
}

function compare(a, b, sort) {
  const [field, direction = "desc"] = String(sort).split(":");
  const left = getFieldValue(a, field);
  const right = getFieldValue(b, field);
  const factor = direction === "asc" ? 1 : -1;

  if (typeof left === "number" || typeof right === "number") {
    return ((Number(left) || 0) - (Number(right) || 0)) * factor;
  }
  return String(left ?? "").localeCompare(String(right ?? "")) * factor;
}

/**
 * @param {object[]} source collection to query
 * @param {{q?:string, searchFields?:string[], status?:string, statusField?:string, sort?:string, page?:number, limit?:number}} params
 * @returns {{rows:object[], total:number, filteredTotal:number, page:number, limit:number, pageCount:number, from:number, to:number}}
 */
export function queryCollection(source, params = {}) {
  const {
    q = "",
    searchFields = ["name"],
    status = "all",
    statusField = "status",
    sort = "updatedAt:desc",
    page = 1,
    limit = 10,
  } = params;

  const term = String(q).trim().toLowerCase();
  const filtered = source.filter(
    (row) =>
      (status === "all" || getFieldValue(row, statusField) === status) &&
      matchesSearch(row, searchFields, term),
  );

  const sorted = [...filtered].sort((a, b) => compare(a, b, sort));

  const safeLimit = Math.max(1, Number(limit) || 10);
  const pageCount = Math.max(1, Math.ceil(sorted.length / safeLimit));
  const safePage = Math.min(Math.max(1, Number(page) || 1), pageCount);
  const start = (safePage - 1) * safeLimit;
  const paged = sorted.slice(start, start + safeLimit);

  return {
    rows: paged,
    total: source.length,
    filteredTotal: sorted.length,
    page: safePage,
    limit: safeLimit,
    pageCount,
    from: sorted.length === 0 ? 0 : start + 1,
    to: start + paged.length,
  };
}
