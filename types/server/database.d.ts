/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import postgres, { TransactionSql } from "postgres";
export declare const sql: postgres.Sql<{}>;
export declare function retryableBegin<T>(options: string, cb: (tsql: TransactionSql<Record<string, unknown>>) => Promise<T>): Promise<T>;
