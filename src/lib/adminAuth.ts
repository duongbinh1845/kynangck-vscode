// Quản lý phiên đăng nhập quản trị phía client.
// Token lưu trong localStorage => đăng nhập 1 lần, dùng cho cả phiên làm việc
// (không phải nhập lại mật khẩu mỗi lần qua lại giữa frontend/backend khi đang dev).

const TOKEN_KEY = 'kynangck_admin_token';

export function getAdminToken(): string | null {
  try {
    return localStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
}

export function setAdminToken(token: string): void {
  try {
    localStorage.setItem(TOKEN_KEY, token);
  } catch {
    /* ignore */
  }
}

export function clearAdminToken(): void {
  try {
    localStorage.removeItem(TOKEN_KEY);
  } catch {
    /* ignore */
  }
}

export function isAdminLoggedIn(): boolean {
  return !!getAdminToken();
}

// Đăng nhập: gửi mật khẩu, nhận & lưu token. Trả về true nếu thành công.
export async function adminLogin(password: string): Promise<boolean> {
  const res = await fetch('/api/auth/login', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ password }),
  });
  if (!res.ok) return false;
  const data = await res.json();
  if (data.token) {
    setAdminToken(data.token);
    return true;
  }
  return false;
}

// Kiểm tra token hiện tại còn hợp lệ không (gọi lúc khởi động).
export async function verifyAdminToken(): Promise<boolean> {
  const token = getAdminToken();
  if (!token) return false;
  try {
    const res = await fetch('/api/auth/verify', {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) return false;
    const data = await res.json();
    if (!data.valid) clearAdminToken();
    return !!data.valid;
  } catch {
    return false;
  }
}

// fetch có gắn sẵn token admin. Dùng cho mọi request quản trị.
// Nếu server trả 401 (token hết hạn) => tự xóa token và ném lỗi để UI xử lý.
export async function adminFetch(input: RequestInfo | URL, init: RequestInit = {}): Promise<Response> {
  const token = getAdminToken();
  const headers = new Headers(init.headers || {});
  if (token) headers.set('Authorization', `Bearer ${token}`);
  const res = await fetch(input, { ...init, headers });
  if (res.status === 401) {
    clearAdminToken();
    window.dispatchEvent(new CustomEvent('admin-session-expired'));
  }
  return res;
}
