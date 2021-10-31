// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { z } from "zod";
import type { loginInputSchema } from "..";
import type { Result } from "./lib/types";

export type LoginResponse = Result<void, Partial<{ [key in keyof z.infer<typeof loginInputSchema>]: string; }>>;

export type Routes = {
  "/api/v1/login": LoginResponse;
  "/api/v1/sleep": {};
};
