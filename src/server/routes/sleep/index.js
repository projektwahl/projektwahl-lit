import { request } from "../../express.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function sleepHandler(stream, headers) {
  return await request("GET", "/api/v1/sleep", function () {
    return new Promise((resolve) => {
      setTimeout(() => {
        resolve([
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          undefined,
        ]);
      }, 100);
    });
  })(stream, headers);
}
