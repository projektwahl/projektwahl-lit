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
import { readFile } from "node:fs/promises";
import { Client, Issuer } from "openid-client";

// OPENID_URL=https://login.microsoftonline.com/e92856e2-3074-46ed-a008-cf3da07639d1/v2.0 CLIENT_ID=639d156d-bda7-4b80-9ef6-7f3017367631

let client: Client | null = null;

async function setupClient() {
  if (process.env["OPENID_URL"]) {
    if (!process.env.BASE_URL) {
      throw new Error("BASE_URL not set!");
    }

    if (!process.env["CLIENT_ID"]) {
      console.error("CLIENT_ID not set!");
      process.exit(1);
    }

    if (!process.env["CREDENTIALS_DIRECTORY"]) {
      console.error("CREDENTIALS_DIRECTORY not set!");
      process.exit(1);
    }

    const client_secret = (
      await readFile(
        process.env.CREDENTIALS_DIRECTORY + "/openid_client_secret",
        "utf8"
      )
    ).trim();

    try {
      const issuer = await Issuer.discover(process.env["OPENID_URL"]);
      const Client = issuer.Client;
      client = new Client({
        client_id: process.env["CLIENT_ID"],
        client_secret,
        redirect_uris: [`${process.env.BASE_URL}/redirect`],
        response_types: ["code"],
      });
    } catch (error) {
      console.error(error);
    }
  }
}

export { setupClient, client };
