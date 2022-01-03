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

import type { z } from "zod";

export const myFetch = async <P extends import("../lib/routes").keys>(
  url: `${P}${string}`,
  options: RequestInit | undefined
): Promise<z.infer<typeof import("../lib/routes").routes[P]["response"]>> => {
  try {
    const response = await fetch(url.toString(), {
      ...options,
      headers: {
        ...options?.headers,
        "x-csrf-protection": "projektwahl",
      },
    });
    if (!response.ok) {
      try {
        const additionalInfo = await response.text();
        return {
          success: false,
          error: {
            network: `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`,
          },
        };
      } catch (error) {
        return {
          success: false,
          error: {
            network: `Failed to request ${url}: ${response.status} ${response.statusText}\n`,
          },
        };
      }
    }
    const result = await response.json();
    return result;
  } catch (error) {
    console.error(error);
    if (error instanceof TypeError) {
      return {
        success: false,
        error: {
          network: `Failed to request ${url}: ${
            error.message
          }\nAdditional information: ${error.stack ?? "none"}`,
        },
      };
    } else {
      return {
        success: false,
        error: {
          network: `Failed to request ${url}: Unknown error see console.`,
        },
      };
    }
  }
  // TODO FIXME this doubles the bundle size
  //return routes[url].response.parse(result)
};

export const sleep = (): Promise<void> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
