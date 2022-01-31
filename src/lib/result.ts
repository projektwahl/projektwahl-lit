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

import { z, ZodObject, ZodType, ZodTypeAny, ZodTypeDef } from "zod";
import type { UnknownKeysParam } from "./routes.js";

export const successResult = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) =>
  z
    .object({
      success: z.literal(true),
      data: s,
    })
    .strict();

// TODO FIXME UPDATE TO zod error schema
export const failureResult = <
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
>(
  s: ZodType<Output, Def, Input>
) =>
  z
    .object({
      success: z.literal(false),
      error: s,
    })
    .strict();

export const result = <
  T extends { [k: string]: ZodTypeAny },
  UnknownKeys extends UnknownKeysParam = "strip",
  Catchall extends ZodTypeAny = ZodTypeAny
>(
  s: ZodObject<T, UnknownKeys, Catchall>
) => z.union([successResult(s), failureResult(z.record(z.string()))]);
