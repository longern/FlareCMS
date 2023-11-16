interface Env {
  BUCKET: R2Bucket;
}

export const onRequestPost: PagesFunction<Env> = async (context) => {
  const { request, env } = context;
  const key = crypto.randomUUID();
  const object = await env.BUCKET.put(key, request.body, {
    httpMetadata: {
      contentType: request.headers.get("content-type") || undefined,
    },
  });
  return Response.json({ id: object.key });
};
