interface Env {
  USERNAME?: string;
  PASSWORD?: string;
}

export function basicAuthenication(
  context: EventContext<Env, any, Record<string, unknown>>
) {
  const { request, env } = context;
  const auth = request.headers.get("Authorization");
  if (!auth) return false;
  const [type, token] = auth.split(" ");
  if (type !== "Basic") return false;
  const [username, password] = atob(token).split(":");
  return username === env.USERNAME && password === env.PASSWORD;
}
