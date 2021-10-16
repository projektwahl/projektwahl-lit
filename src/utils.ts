// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { Routes } from "./routes";

export async function myFetch<P extends keyof Routes>(
  input: P,
  init?: RequestInit
): Promise<Routes[P]> {
  const response = await fetch(input, init);
  if (!response.ok) {
    throw new Error(
      `Network response was not OK: ${response.status} ${response.statusText}`
    );
  }
  return await response.json() as Routes[P];
}
