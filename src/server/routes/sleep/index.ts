import { request } from "../../express.js";

export async function sleepHandler(stream: import("http2").ServerHttp2Stream, headers: import("http2").IncomingHttpHeaders) {
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
