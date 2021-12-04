// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

/** @type {<P extends keyof import("../lib/routes").routes>(
  url: P,
  options: RequestInit | undefined
) => Promise<
  import("../lib/types").Result<
    import("../lib/routes").routes[P],
    { network?: string } & { [key in keyof import("../lib/routes").routes[P]]?: string }
  >
>} */
export const myFetch = async (url, options) => {
  const response = await fetch(url, options);
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
};

/**
 *
 * @returns {Promise<void>}
 */
export const sleep = () => {
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, 500);
  });
};
