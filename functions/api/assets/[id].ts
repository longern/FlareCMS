interface Env {
  BUCKET: R2Bucket;
}

export const onRequestGet: PagesFunction<Env> = async (context) => {
  const { request, env, params } = context;
  const key = params.id as string;

  const object = await env.BUCKET.get(key, {
    range: request.headers,
  }) as R2ObjectBody
  if (!object) {
    return Response.json({ error: "Not found" }, { status: 404 });
  }

  const headers = new Headers();
  object.writeHttpMetadata(headers);
  headers.set("catch-control", "public, max-age=31536000");
  if (object.range) {
    const range = object.range as {
      offset: number;
      length: number;
      end: number;
    };
    const end = range.end ?? object.size - 1;
    headers.set("content-range", `bytes ${range.offset}-${end}/${object.size}`);
  }
  const status = request.headers.get("range") !== null ? 206 : 200;
  return new Response(object.body, { headers, status });
};
