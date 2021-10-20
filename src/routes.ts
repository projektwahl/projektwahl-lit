// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { OptionalResult, Result } from "./lib/result";
import { Existing, RawUserType } from "./lib/types";

export type LoginResponse = OptionalResult<Existing<RawUserType>>;

export type TestResponse = number;

export type Routes = {
  "/api/v1/login": LoginResponse;
  "/api/v1/test": TestResponse;
  "/api/v1/sleep": string;
};
