import { supabase } from "./supabase";

// Sessão anônima por aba: ajuda a medir em qual etapa as pessoas desistem. Não guarda dados pessoais.
let sid = "";
function sessionId() {
  if (sid) return sid;
  try {
    sid = sessionStorage.getItem("ac_sid") || "";
    if (!sid) {
      sid = Math.random().toString(36).slice(2) + Date.now().toString(36);
      sessionStorage.setItem("ac_sid", sid);
    }
  } catch {
    sid = Math.random().toString(36).slice(2);
  }
  return sid;
}

export function track(evento: string, extra: { step?: number; deck?: string } = {}) {
  try {
    void supabase
      .rpc("pesquisa_track", {
        p_session: sessionId(),
        p_evento: evento,
        p_step: extra.step ?? null,
        p_origem: (document.referrer || "").slice(0, 200),
      })
      .then(() => {}, () => {});
  } catch {
    /* tracking nunca deve quebrar a experiência */
  }
}
