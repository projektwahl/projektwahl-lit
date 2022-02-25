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

//import { ZodIssueCode } from "zod";
import type { ResponseType } from "../lib/routes";
import jscookie from "js-cookie";

export const myFetch = async <P extends import("../lib/routes").keys>(
  url: `${P}${string}`,
  options: RequestInit | undefined
): Promise<ResponseType<P>> => {
  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        ...options?.headers,
        "x-csrf-protection": "projektwahl",
      },
    });
    if (!response.ok) {
      if (response.status == 401) {
        // unauthorized
        jscookie.remove("lax_id");
        jscookie.remove("strict_id");
        jscookie.remove("username");

        const bc = new BroadcastChannel("updateloginstate");
        bc.postMessage("logout");
      }
      try {
        const additionalInfo = await response.text();
        return {
          success: false,
          error: {
            issues: [
              {
                code: "custom", // ZodIssueCode.custom,
                path: ["network"],
                message: `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`,
              },
            ],
          },
        };
      } catch (error) {
        const r: ResponseType<P> = {
          success: false,
          error: {
            issues: [
              {
                code: "custom", // ZodIssueCode.custom,
                path: ["network"],
                message: `Failed to request ${url}: ${response.status} ${response.statusText}\n`,
              },
            ],
          },
        };
        return r;
      }
    }
    const result = (await response.json()) as ResponseType<P>;
    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      return {
        success: false,
        error: {
          issues: [
            {
              code: "custom", // ZodIssueCode.custom,
              path: ["network"],
              message: `Failed to request ${url}: ${
                error.message
              }\nAdditional information: ${error.stack ?? "none"}`,
            },
          ],
        },
      };
    } else {
      return {
        success: false,
        error: {
          issues: [
            {
              code: "custom", // ZodIssueCode.custom,
              path: ["network"],
              message: `Failed to request ${url}: Unknown error see console.`,
            },
          ],
        },
      };
    }
  }
  // TODO FIXME this doubles the bundle size
  //return routes[url].response.parse(result)
};

export const sleep = (timeout: number): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, timeout);
  });
};

type PathTree<T> = {
  [P in keyof T]-?: T[P] extends object ? [P] | [P, ...Path<T[P]>] : [P];
};

export type Path<T> = PathTree<T>[keyof PathTree<T>];
