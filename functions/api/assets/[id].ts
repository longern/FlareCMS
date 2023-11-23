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

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("catch-control", "public, max-age=31536000, immutable");
  return new Response(object.body, { headers });
};
