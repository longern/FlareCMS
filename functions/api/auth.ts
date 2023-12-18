import jwt from '@tsndr/cloudflare-worker-jwt'

interface Env {
  SECRET?: string;
}

export function jwtAuthenication(
  context: EventContext<Env, any, Record<string, unknown>>
) {
  const { request, env } = context;
  const auth = request.headers.get("Authorization");
  if (!auth) return false;
  const [type, token] = auth.split(" ");
  if (type !== "Bearer") return false;
  return jwt.verify(token, env.SECRET);
}
