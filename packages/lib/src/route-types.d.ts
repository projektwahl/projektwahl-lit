// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { z, ZodType } from "zod";
import type { loginInputSchema } from "./routes";
import type { Result } from "./types";

export type LoginResponse = Result<void, Partial<{ [key in keyof z.infer<typeof loginInputSchema>]: string; }>>;
