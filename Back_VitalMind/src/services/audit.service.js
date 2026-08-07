import { getMySqlPool } from "../config/databases.js";

export async function logAudit(actorId, action, entity, entityId = null, payload = {}) {
  try {
    await getMySqlPool().query(
      "INSERT INTO audit_logs (actor_id, action, entity, entity_id, payload) VALUES (?, ?, ?, ?, ?)",
      [actorId, action, entity, entityId, JSON.stringify(payload)]
    );
  } catch {
    return;
  }
}
