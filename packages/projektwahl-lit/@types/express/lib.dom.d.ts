// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { HistoryState } from "../../src/history-controller";

declare global {
  interface WindowEventHandlersEventMap {
    navigate: CustomEvent<{
      url: URL;
      state: HistoryState;
    }>;
  }
}
