/*
projektwahl-lit is a software to manage choosing projects and automatically assigning people to projects.
Copyright (C) 2021 Moritz Hedtke

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as published
by the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see https://www.gnu.org/licenses/.
*/
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { MyRequest, requestHandler } from "../../express.js";
import { client } from "./openid-client.js";
import type { ServerResponse } from "node:http";
import type { Http2ServerResponse } from "node:http2";

export async function openidLoginHandler(
  request: MyRequest,
  response: ServerResponse | Http2ServerResponse
) {
  return await requestHandler("GET", "/api/v1/openid-login", function () {
    // https://github.com/AzureAD/microsoft-authentication-library-for-js/tree/dev/lib/msal-browser
    // https://docs.microsoft.com/en-us/azure/active-directory/develop/scenario-spa-app-registration
    // USE single tenant as for all others we need permissions

    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL not set!");
    }

    if (!client) {
      throw new Error("OpenID not configured!");
    }

    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/login/index.json.ts
    // https://github.com/projektwahl/projektwahl-sveltekit/blob/work/src/routes/redirect/index.ts_old
    const url = client.authorizationUrl({
      redirect_uri: `${process.env.BASE_URL}/redirect`,
      scope: "openid email",
    });

    console.log(url);

    /** @type {import("node:http2").OutgoingHttpHeaders} */
    const headers: import("node:http2").OutgoingHttpHeaders = {
      "content-type": "text/json; charset=utf-8",
      ":status": 302,
      location: url,
    };
    return [
      headers,
      {
        success: true,
        data: {},
      },
    ];
  })(request, response);
}
