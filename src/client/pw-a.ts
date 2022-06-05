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
import { HistoryController } from "./history-controller.js";

// TODO FIXME https://lit.dev/docs/components/events/#shadowdom-retargeting just use the approach shown there

export const aClick = (event: MouseEvent) => {
  if (!event.altKey && !event.ctrlKey && !event.metaKey && !event.shiftKey) {
    event.preventDefault();
    if (!(event.target instanceof Element)) {
      throw new Error("link not found");
    }
    const target = event.target.closest("a");
    if (!target) {
      throw new Error("link not found");
    }
    HistoryController.goto(
      new URL(target.href, window.location.href),
      {},
      false
    );
  }
};
