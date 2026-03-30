import { supabase } from "../../lib/supabaseClient";

const ADMIN_UNDO_KEY = "adminUndo:lastAction:v1";
const ADMIN_UNDO_TABLE = "admin_deleted_records";
const DEFAULT_RETENTION_MS = 30 * 24 * 60 * 60 * 1000;

const safeParseJson = (value) => {
  if (!value) return null;
  try {
    return JSON.parse(value);
  } catch {
    return null;
  }
};

const toIso = (value) => new Date(value).toISOString();

const mapUndoRow = (row) => ({
  id: row.id,
  label: row.label,
  table: row.table_name,
  tabKey: row.tab_key,
  payload: row.payload || {},
  deletedBy: row.deleted_by || null,
  deletedAt: row.deleted_at,
  expiresAt: row.expires_at,
});

export const loadAdminUndoAction = () => {
  if (typeof window === "undefined") return null;
  return safeParseJson(window.localStorage.getItem(ADMIN_UNDO_KEY));
};

export const saveAdminUndoAction = (action) => {
  if (typeof window === "undefined") return { success: false, error: "No window" };
  try {
    window.localStorage.setItem(ADMIN_UNDO_KEY, JSON.stringify(action));
    return { success: true };
  } catch (error) {
    return { success: false, error };
  }
};

export const clearAdminUndoAction = () => {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(ADMIN_UNDO_KEY);
};

export const purgeExpiredAdminUndoHistory = async () => {
  const nowIso = toIso(Date.now());
  await supabase
    .from(ADMIN_UNDO_TABLE)
    .delete()
    .lte("expires_at", nowIso);
};

export const loadAdminUndoHistory = async () => {
  await purgeExpiredAdminUndoHistory();
  const { data, error } = await supabase
    .from(ADMIN_UNDO_TABLE)
    .select("id, label, table_name, tab_key, payload, deleted_by, deleted_at, expires_at")
    .order("deleted_at", { ascending: false });

  if (error) {
    console.error("Failed to load undo history:", error.message || error);
    return [];
  }

  return (data || []).map(mapUndoRow);
};

export const saveDeletedAdminRecord = async (record) => {
  const now = Date.now();
  const expiresAt = now + DEFAULT_RETENTION_MS;
  const payload = {
    label: record?.label || "Deleted record",
    table_name: record?.table || "unknown",
    tab_key: record?.tabKey || "unknown",
    payload: record?.payload || {},
    deleted_by: record?.deletedBy || null,
    deleted_at: toIso(now),
    expires_at: toIso(expiresAt),
  };

  const { error } = await supabase.from(ADMIN_UNDO_TABLE).insert([payload]);
  if (error) {
    return { success: false, error };
  }
  return { success: true };
};

export const removeAdminUndoRecord = async (id) => {
  const { error } = await supabase
    .from(ADMIN_UNDO_TABLE)
    .delete()
    .eq("id", id);

  if (error) {
    return { success: false, error };
  }
  return { success: true };
};

export const clearAdminUndoHistory = async () => {
  const { error } = await supabase
    .from(ADMIN_UNDO_TABLE)
    .delete()
    .not("id", "is", null);

  if (error) {
    return { success: false, error };
  }
  return { success: true };
};

export const setAdminUndoDebugExpiry = async (minutes = 1) => {
  const nextExpiry = toIso(Date.now() + Math.max(1, Number(minutes || 1)) * 60 * 1000);
  const nowIso = toIso(Date.now());
  const { error } = await supabase
    .from(ADMIN_UNDO_TABLE)
    .update({ expires_at: nextExpiry })
    .gt("expires_at", nowIso);

  if (error) {
    return { success: false, error };
  }
  return { success: true };
};

