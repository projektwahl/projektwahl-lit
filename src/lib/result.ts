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

import { z, ZodType, ZodTypeDef } from "zod";

export const successResult = <
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
>(
  s: ZodType<Output, Def, Input>
) =>
  z
    .object({
      success: z.literal(true),
      data: s,
    })
    .strict();

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
  Output,
  Def extends ZodTypeDef = ZodTypeDef,
  Input = Output
>(
  s: ZodType<Output, Def, Input>
) => z.union([successResult(s), failureResult(z.record(z.string()))]);

export const zod2result = <T extends z.ZodTypeAny>(
  schema: T,
  input: unknown
): z.infer<T> => {
  const result = schema.safeParse(input);
  if (result.success) {
    return result;
  } else {
    const flattenedErrors = result.error.flatten();
    console.log(result.error);

    /** @type {{[k: string]: string[];}} */
    const errors: { [k: string]: string[] } = {
      ...(flattenedErrors.formErrors.length == 0
        ? {}
        : { formErrors: flattenedErrors.formErrors }),
      ...flattenedErrors.fieldErrors,
    };
    const errors2 =
      /** @type {Partial<{ [key in keyof z.infer<T>]: string; }>} */ Object.fromEntries(
        Object.entries(errors).map(([k, v]) => [k, v.join(". ")])
      );
    return {
      success: false,
      error: errors2,
    };
  }
};
