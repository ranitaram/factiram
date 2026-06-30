const VISITOR_KEY = "factiram_vid";
const SESSION_KEY = "factiram_sid";
const SESSION_TIME_KEY = "factiram_slast";
const TIMEOUT = 30 * 60 * 1000;

export function getVisitorId(): string {
  let id = localStorage.getItem(VISITOR_KEY);
  if (!id) {
    id = crypto.randomUUID();
    localStorage.setItem(VISITOR_KEY, id);
  }
  return id;
}

export function getSessionId(): string {
  const last = localStorage.getItem(SESSION_TIME_KEY);
  const now = Date.now();
  let id = localStorage.getItem(SESSION_KEY);

  if (!id || (last && now - Number(last) > TIMEOUT)) {
    id = crypto.randomUUID();
    localStorage.setItem(SESSION_KEY, id);
  }
  localStorage.setItem(SESSION_TIME_KEY, String(now));
  return id;
}
