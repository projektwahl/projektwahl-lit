// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

// TODO FIXME remove all this and convert to zod

export type RawSessionType = {
  session_id: string;
  created_at: Date;
  updated_at: Date;
  user_id: number;
};

export type RawChoiceType = {
  user_id: number;
  project_id: number;
  rank: number;
};

export type ResettableChoiceType = {
  user_id: number;
  project_id: number;
  rank: number | null;
};

export type EntityResponseBody<T> = {
  entities: Array<T>;
  previousCursor: T | null;
  nextCursor: T | null;
};

export type BaseQuery<C> = {
  paginationDirection: "forwards" | "backwards";
  paginationCursor: C | null; // if this is null the start is at start/end depending on paginationDirection
  sorting: [keyof C, "ASC" | "DESC"][];
  paginationLimit: number;
  filters: {
    [key in keyof C]?: C[key]; // boolean | string | number | string[] | null | undefined // TODO FIXME C[key]
  };
};

export interface WritableTemplateStringsArray extends Array<string> {
  raw?: string[];
}
