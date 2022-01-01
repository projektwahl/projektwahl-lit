// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { z } from "zod";

export const myFetch = async <P extends import("../lib/routes").keys>(
  url: `${P}${string}`,
  options: RequestInit | undefined
): Promise<z.infer<typeof import("../lib/routes").routes[P]["response"]>> => {
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
      throw new Error(
        `Failed to request ${url}: ${response.status} ${response.statusText}\nAdditional information: ${additionalInfo}`
      );
    } catch (error) {
      throw new Error(
        `Failed to request ${url}: ${response.status} ${response.statusText}\n`
      );
    }
  }
  const result = await response.json();
  return result;
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
