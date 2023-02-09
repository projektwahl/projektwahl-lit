/// <reference types="node" />
/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { FileHandle } from "node:fs/promises";
import type { TransactionSql } from "postgres";
export declare class CPLEXLP {
    dir: string;
    filePath: string;
    fileHandle: FileHandle;
    solutionPath: string;
    problemPath: string;
    problemFreeMpsPath: string;
    setup: () => Promise<void>;
    startMaximize: () => Promise<void>;
    maximize: (factor: number, variable: string) => Promise<void>;
    startConstraints: () => Promise<void>;
    constraint: (name: string, min: number | null, constraints: [number, string][], max: number | null) => Promise<void>;
    startBounds: () => Promise<void>;
    bound: (min: number | null, name: string, max: number | null) => Promise<void>;
    startVariables: () => Promise<void>;
    variable: (name: string) => Promise<void>;
    startBinaryVariables: () => Promise<void>;
    binaryVariable: (name: string) => Promise<void>;
    calculate: () => Promise<[string, number][]>;
}
export declare const rank2points: (rank: number) => 1 | 0 | 2 | 3 | 4 | 5;
export declare function evaluate(tsql: TransactionSql<Record<string, unknown>>, update: boolean): Promise<{
    overloaded: [number, number][];
    underloaded: [number, number][];
    notexists: number[];
    choices: [number, number, number][];
}>;
