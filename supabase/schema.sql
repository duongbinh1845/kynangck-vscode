-- KynangCK AI Studio — Supabase Schema
-- Chạy file này trong Supabase SQL Editor: Dashboard > SQL Editor > New query > Paste & Run

-- Bảng lưu trạng thái ứng dụng dạng key-value (JSONB).
-- Mỗi collection của app (projects, parents, cms...) là 1 row.
-- Lý do dùng JSONB thay vì relational: cấu trúc dữ liệu lồng nhau sâu,
-- toàn bộ app luôn đọc/ghi nguyên bộ qua getDb()/writeDb().
CREATE TABLE IF NOT EXISTS app_state (
  key   TEXT PRIMARY KEY,
  data  JSONB NOT NULL DEFAULT '[]'::jsonb,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Auto-update updated_at khi row thay đổi
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_app_state_updated_at
  BEFORE UPDATE ON app_state
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- RLS: Chỉ service_role có quyền đọc/ghi (backend only).
-- Không có policy nào => anon key KHÔNG truy cập được.
ALTER TABLE app_state ENABLE ROW LEVEL SECURITY;

-- Nếu cần anon đọc (ví dụ: frontend render danh sách công khai), uncomment:
-- CREATE POLICY "Public read projects" ON app_state
--   FOR SELECT USING (key = 'projects');
