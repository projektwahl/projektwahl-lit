// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

import type { Existing, RawUserType } from "./lib/types";

export type LoginResponse = Existing<RawUserType>;

export type Routes = {
  "/api/v1/login": LoginResponse;
  "/api/v1/sleep": {};
};
