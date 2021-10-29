// SPDX-License-Identifier: AGPL-3.0-or-later
// SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>

export type OptionalResult<
  T,
  E extends { [key: string]: string } = { [key in keyof T]: string }
> = Result<T, E> | NoneResult<T, E>;

export type Result<
  T,
  E extends { [key: string]: string } = { [key in keyof T]: string }
> = SuccessResult<T, E> | FailureResult<T, E>;

export type NoneResult<
  T,
  E extends { [key: string]: string } = { [key in keyof T]: string }
> = {
  result: "none";
};

export type SuccessResult<
  T,
  E extends { [key: string]: string } = { [key in keyof T]: string }
> = {
  result: "success";
  success: T;
};

export type FailureResult<
  T,
  E extends { [key: string]: string } = { [key in keyof T]: string }
> = {
  result: "failure";
  failure: E;
};

export type New<T> = T & { id?: number };
export type Existing<T> = T & { id: number };

export type RawUserType = {
  username: string;
  password: string;
  type: "helper" | "admin" | "voter";
  group: string; // TODO FIXME null
  age: number; // TODO FIXME null
  away: boolean;
  project_leader_id: number | null;
  force_in_project_id: number | null;
};

export type RawProjectType = {
  title: string;
  info: string;
  place: string;
  costs: number;
  min_age: number;
  max_age: number;
  min_participants: number;
  max_participants: number;
  presentation_type: string;
  requirements: string;
  random_assignments: boolean;
};

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
