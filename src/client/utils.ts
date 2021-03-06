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

import { MinimalSafeParseError, ResponseType, routes } from "../lib/routes.js";
import jscookie from "js-cookie";
import type { z } from "zod";

export const myFetch = async <P extends keyof typeof routes>(
  method: "GET" | "POST",
  url: P,
  body: z.infer<typeof routes[P]["request"]>,
  options: RequestInit
): Promise<ResponseType<P>> => {
  try {
    const response =
      method === "GET"
        ? await fetch(`${url}?${encodeURIComponent(JSON.stringify(body))}`, {
            ...options,
            headers: {
              ...options.headers,
              "x-csrf-protection": "projektwahl",
            },
            method,
          })
        : await fetch(url, {
            ...options,
            headers: {
              ...options.headers,
              "x-csrf-protection": "projektwahl",
              "content-type": "text/json",
            },
            method,
            body: JSON.stringify(body),
          });
    if (!response.ok) {
      if (response.status == 401) {
        // unauthorized
        jscookie.remove("lax_id");
        jscookie.remove("strict_id");
        jscookie.remove("username");
        jscookie.remove("type");

        localStorage.setItem("stateupdate", "logout");
        window.dispatchEvent(
          new StorageEvent("storage", {
            newValue: "logout",
          })
        );
      }
      try {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-return
        return await response.json();
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
    // TODO FIXME maybe include the result shit in the typings directly
    // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
    const json = await response.json();
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    if (json.success) {
      const a: typeof routes[P] = routes[url];
      const b: typeof routes[P]["response"] = a.response;
      const c:
        | z.SafeParseSuccess<z.infer<typeof routes[P]["response"]>>
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        | MinimalSafeParseError = b.safeParse(json.data);
      if (!c.success) {
        console.error(c.error);
      }
      return c;
    } else {
      // eslint-disable-next-line @typescript-eslint/consistent-type-assertions
      return json as MinimalSafeParseError;
    }
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

export const suspend = (): Promise<void> => {
  return new Promise((resolve) => {
    setImmediate(resolve);
  });
};

type PathTree<T> = {
  [P in keyof T]-?: T[P] extends object ? [P] | [P, ...Path<T[P]>] : [P];
};

export type Path<T> = PathTree<T>[keyof PathTree<T>];
