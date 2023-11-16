interface Env {
  BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { env, params } = context;
  const key = params.id as string;
  const object = await env.BUCKET.get(key);
  if (!object) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }
  return new Response(object.body);
};
