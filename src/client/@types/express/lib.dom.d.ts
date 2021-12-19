// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
import { HistoryState } from "../../history-controller.js";

declare global {
  interface WindowEventHandlersEventMap {
    navigate: CustomEvent<{
      url: URL;
      state: HistoryState;
    }>;
  }

  interface HTMLElementEventMap {
    myformdata: CustomEvent<{}>;
  }
}
