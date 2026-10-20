export class BodyTooLargeError extends Error {}
export async function readJson(
  request: Request,
  maxBytes = 30000,
): Promise<unknown> {
  if (Number(request.headers.get("content-length") || 0) > maxBytes)
    throw new BodyTooLargeError("Request is too large");
  const reader = request.body?.getReader();
  if (!reader) throw new SyntaxError("Missing JSON body");
  const decoder = new TextDecoder();
  let bytes = 0,
    text = "";
  try {
    while (true) {
      const chunk = await reader.read();
      if (chunk.done) break;
      bytes += chunk.value.byteLength;
      if (bytes > maxBytes) {
        await reader.cancel();
        throw new BodyTooLargeError("Request is too large");
      }
      text += decoder.decode(chunk.value, { stream: true });
    }
    text += decoder.decode();
    return JSON.parse(text);
  } finally {
    reader.releaseLock();
  }
}
