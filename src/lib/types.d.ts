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

// TODO FIXME remove all this and convert to zod

type RawChoiceType = {
  user_id: number;
  project_id: number;
  rank: number;
};

type ResettableChoiceType = {
  user_id: number;
  project_id: number;
  rank: number | null;
};

type EntityResponseBody<T> = {
  entities: Array<T>;
  previousCursor: T | null;
  nextCursor: T | null;
};

type FilterType<Type> = {
  [Property in keyof Type as `f_${string & Property}`]?: Type[Property];
};

type BaseQuery<C> = {
  paginationDirection: "forwards" | "backwards";
  paginationCursor: C | null; // if this is null the start is at start/end depending on paginationDirection
  sorting: [keyof C, "ASC" | "DESC"][];
  paginationLimit: number;
};

export interface WritableTemplateStringsArray extends Array<string> {
  raw?: string[];
}
