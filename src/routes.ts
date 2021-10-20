// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import { Result } from "./lib/result";
import { Existing, RawUserType } from "./lib/types";

type LoginResponse = Result<Existing<RawUserType>>;

type TestResponse = number;

export type Routes = {
  "/api/v1/login": LoginResponse;
  "/api/v1/test": TestResponse;
  "/api/v1/sleep": string;
};
