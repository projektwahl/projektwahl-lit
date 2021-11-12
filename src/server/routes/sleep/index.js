import { sql } from "../../database.js";
import { request } from "../../express.js";

/**
 *
 * @param {import("http2").ServerHttp2Stream} stream
 * @param {import("http2").IncomingHttpHeaders} headers
 */
export async function sleepHandler(stream, headers) {
    await request("GET", "/api/v1/sleep", function (req) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        resolve([
          {
            "content-type": "text/json; charset=utf-8",
            ":status": 200,
          },
          undefined,
        ]);
      }, 1000);
    });
  })(stream, headers);
}