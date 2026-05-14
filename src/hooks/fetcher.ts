export const fetcher = async <T>(url: string): Promise<T> => {
  const res = await fetch(url);
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || "Lỗi tải dữ liệu");
  }
  return res.json();
};

export const mutate = async <T>(
  url: string,
  method: "POST" | "PUT" | "DELETE",
  data?: unknown,
  errorMsg = "Lỗi thao tác"
): Promise<T> => {
  const res = await fetch(url, {
    method,
    headers: data ? { "Content-Type": "application/json" } : undefined,
    body: data ? JSON.stringify(data) : undefined,
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.error || errorMsg);
  }
  return res.json();
};
