/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { TemplateResult } from "lit";
import { HistoryController } from "../history-controller.js";
import { entityRoutes, ResponseType } from "../../lib/routes.js";
import { z } from "zod";
import { PwForm } from "../form/pw-form.js";
export type parseRequestWithPrefixType<PREFIX extends string> = {
    [P in keyof typeof entityRoutes]: z.infer<z.ZodObject<{
        [k in PREFIX]: typeof entityRoutes[P]["request"];
    }, "passthrough", z.ZodTypeAny, {
        [k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]>;
    }, Record<string, unknown>>>;
};
export type parseRequestWithPrefixSchemaType<PREFIX extends string> = {
    [P in keyof typeof entityRoutes]: z.ZodObject<{
        [k in PREFIX]: typeof entityRoutes[P]["request"];
    }, "passthrough", z.ZodTypeAny, {
        [k in PREFIX]: z.infer<typeof entityRoutes[P]["request"]>;
    }, Record<string, unknown>>;
};
export declare const parseRequestWithPrefix: <P extends "/api/v1/users" | "/api/v1/projects" | "/api/v1/choices" | "/api/v1/sessions" | "/api/v1/settings", PREFIX extends string>(apiUrl: P, prefix: PREFIX, url: URL, defaultValue: z.TypeOf<{
    "/api/v1/users": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>>;
            filters: z.ZodObject<{
                type: z.ZodOptional<z.ZodEnum<["voter", "helper", "admin"]>>;
                username: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                project_leader_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodOptional<z.ZodBoolean>;
                valid: z.ZodOptional<z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"valid">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"username">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"type">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"group">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"project_leader_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"force_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"computed_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["valid", "ASC" | "DESC", null] | ["username", "ASC" | "DESC", null] | ["type", "ASC" | "DESC", null] | ["group", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["computed_in_project_id", "ASC" | "DESC", number])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["valid", "ASC" | "DESC", null] | ["username", "ASC" | "DESC", null] | ["type", "ASC" | "DESC", null] | ["group", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["computed_in_project_id", "ASC" | "DESC", number])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }[];
            previousCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
            nextCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
        }, {
            entities: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }[];
            previousCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
            nextCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
        }>;
    };
    "/api/v1/projects": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>>;
            filters: z.ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                deleted: z.ZodOptional<z.ZodBoolean>;
                info: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            }, {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"title">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"info">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"project_leader_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"force_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["title", "ASC" | "DESC", null] | ["info", "ASC" | "DESC", null])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["title", "ASC" | "DESC", null] | ["info", "ASC" | "DESC", null])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
        }, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
        }>;
    };
    "/api/v1/choices": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>>;
            filters: z.ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                info: z.ZodOptional<z.ZodString>;
                rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            }, "strict", z.ZodTypeAny, {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            }, {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"title">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"rank">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["title", "ASC" | "DESC", null] | ["rank", "ASC" | "DESC", null])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["title", "ASC" | "DESC", null] | ["rank", "ASC" | "DESC", null])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
        }, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
        }>;
    };
    "/api/v1/sessions": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>>;
            filters: z.ZodObject<{
                user_id: z.ZodNullable<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                user_id: number | null;
            }, {
                user_id: number | null;
            }>;
            sorting: z.ZodArray<z.ZodTuple<[z.ZodLiteral<"session_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, "many">;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                user_id: number | null;
            };
            sorting: ["session_id", "ASC" | "DESC", null][];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null | undefined;
            paginationLimit?: number | undefined;
            filters: {
                user_id: number | null;
            };
            sorting: ["session_id", "ASC" | "DESC", null][];
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }[];
            previousCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
            nextCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
        }, {
            entities: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }[];
            previousCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
            nextCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
        }>;
    };
    "/api/v1/settings": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>>;
            filters: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
            sorting: z.ZodArray<z.ZodTuple<[z.ZodLiteral<"fake_sort">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, "many">;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {};
            sorting: ["fake_sort", "ASC" | "DESC", null][];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null | undefined;
            paginationLimit?: number | undefined;
            filters: {};
            sorting: ["fake_sort", "ASC" | "DESC", null][];
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }[];
            previousCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
            nextCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
        }, {
            entities: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }[];
            previousCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
            nextCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
        }>;
    };
}[P]["request"]>) => parseRequestWithPrefixType<PREFIX>[P];
export declare const taskFunction: <P extends "/api/v1/users" | "/api/v1/projects" | "/api/v1/choices" | "/api/v1/sessions" | "/api/v1/settings", PREFIX extends string>(apiUrl: P, url: URL, prefix: PREFIX, defaultValue: z.TypeOf<{
    "/api/v1/users": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>>;
            filters: z.ZodObject<{
                type: z.ZodOptional<z.ZodEnum<["voter", "helper", "admin"]>>;
                username: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
                project_leader_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodOptional<z.ZodBoolean>;
                valid: z.ZodOptional<z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"valid">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"username">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"type">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"group">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"project_leader_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"force_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"computed_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["valid", "ASC" | "DESC", null] | ["username", "ASC" | "DESC", null] | ["type", "ASC" | "DESC", null] | ["group", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["computed_in_project_id", "ASC" | "DESC", number])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["valid", "ASC" | "DESC", null] | ["username", "ASC" | "DESC", null] | ["type", "ASC" | "DESC", null] | ["group", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["computed_in_project_id", "ASC" | "DESC", number])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                type?: "voter" | "helper" | "admin" | undefined;
                username?: string | undefined;
                id?: number | undefined;
                group?: string | null | undefined;
                project_leader_id?: number | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                deleted?: boolean | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                type: z.ZodEnum<["voter", "helper", "admin"]>;
                username: z.ZodString;
                id: z.ZodNumber;
                group: z.ZodNullable<z.ZodString>;
                age: z.ZodNullable<z.ZodNumber>;
                openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
                away: z.ZodBoolean;
                project_leader_id: z.ZodNullable<z.ZodNumber>;
                force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
                deleted: z.ZodBoolean;
                valid: z.ZodOptional<z.ZodEnum<["valid", "invalid", "project_leader", "neutral"]>>;
                voted_choices: z.ZodOptional<z.ZodNullable<z.ZodArray<z.ZodString, "many">>>;
            }, "strict", z.ZodTypeAny, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }, {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }[];
            previousCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
            nextCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
        }, {
            entities: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            }[];
            previousCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
            nextCursor: {
                valid?: "invalid" | "valid" | "project_leader" | "neutral" | undefined;
                openid_id?: string | null | undefined;
                force_in_project_id?: number | null | undefined;
                computed_in_project_id?: number | null | undefined;
                voted_choices?: string[] | null | undefined;
                type: "voter" | "helper" | "admin";
                username: string;
                id: number;
                group: string | null;
                age: number | null;
                away: boolean;
                project_leader_id: number | null;
                deleted: boolean;
            } | null;
        }>;
    };
    "/api/v1/projects": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>>;
            filters: z.ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                deleted: z.ZodOptional<z.ZodBoolean>;
                info: z.ZodOptional<z.ZodString>;
            }, "strict", z.ZodTypeAny, {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            }, {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"title">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"info">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"project_leader_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>, z.ZodTuple<[z.ZodLiteral<"force_in_project_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNumber], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["title", "ASC" | "DESC", null] | ["info", "ASC" | "DESC", null])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["project_leader_id", "ASC" | "DESC", number] | ["force_in_project_id", "ASC" | "DESC", number] | ["title", "ASC" | "DESC", null] | ["info", "ASC" | "DESC", null])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                deleted?: boolean | undefined;
                info?: string | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
                project_leaders: z.ZodArray<z.ZodString, "many">;
                computed_in_projects: z.ZodArray<z.ZodString, "many">;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
        }, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                project_leaders: string[];
                computed_in_projects: string[];
            } | null;
        }>;
    };
    "/api/v1/choices": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>>;
            filters: z.ZodObject<{
                title: z.ZodOptional<z.ZodString>;
                id: z.ZodOptional<z.ZodNumber>;
                info: z.ZodOptional<z.ZodString>;
                rank: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            }, "strict", z.ZodTypeAny, {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            }, {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            }>;
            sorting: z.ZodDefault<z.ZodArray<z.ZodUnion<[z.ZodTuple<[z.ZodLiteral<"id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"title">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, z.ZodTuple<[z.ZodLiteral<"rank">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>]>, "many">>;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            };
            sorting: (["id", "ASC" | "DESC", null] | ["title", "ASC" | "DESC", null] | ["rank", "ASC" | "DESC", null])[];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null | undefined;
            sorting?: (["id", "ASC" | "DESC", null] | ["title", "ASC" | "DESC", null] | ["rank", "ASC" | "DESC", null])[] | undefined;
            paginationLimit?: number | undefined;
            filters: {
                title?: string | undefined;
                id?: number | undefined;
                info?: string | undefined;
                rank?: number | null | undefined;
            };
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                rank: z.ZodNullable<z.ZodNumber>;
                project_id: z.ZodNullable<z.ZodNumber>;
                user_id: z.ZodNullable<z.ZodNumber>;
                title: z.ZodString;
                id: z.ZodNumber;
                deleted: z.ZodBoolean;
                info: z.ZodString;
                place: z.ZodString;
                costs: z.ZodNumber;
                min_age: z.ZodNumber;
                max_age: z.ZodNumber;
                min_participants: z.ZodNumber;
                max_participants: z.ZodNumber;
                random_assignments: z.ZodBoolean;
            }, "strict", z.ZodTypeAny, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }, {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
        }, {
            entities: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            }[];
            previousCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
            nextCursor: {
                title: string;
                id: number;
                deleted: boolean;
                info: string;
                place: string;
                costs: number;
                min_age: number;
                max_age: number;
                min_participants: number;
                max_participants: number;
                random_assignments: boolean;
                rank: number | null;
                project_id: number | null;
                user_id: number | null;
            } | null;
        }>;
    };
    "/api/v1/sessions": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>>;
            filters: z.ZodObject<{
                user_id: z.ZodNullable<z.ZodNumber>;
            }, "strict", z.ZodTypeAny, {
                user_id: number | null;
            }, {
                user_id: number | null;
            }>;
            sorting: z.ZodArray<z.ZodTuple<[z.ZodLiteral<"session_id">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, "many">;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {
                user_id: number | null;
            };
            sorting: ["session_id", "ASC" | "DESC", null][];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null | undefined;
            paginationLimit?: number | undefined;
            filters: {
                user_id: number | null;
            };
            sorting: ["session_id", "ASC" | "DESC", null][];
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                session_id: z.ZodString;
                created_at: z.ZodString;
                updated_at: z.ZodString;
                user_id: z.ZodNumber;
            }, "strict", z.ZodTypeAny, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }, {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }[];
            previousCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
            nextCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
        }, {
            entities: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            }[];
            previousCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
            nextCursor: {
                user_id: number;
                session_id: string;
                created_at: string;
                updated_at: string;
            } | null;
        }>;
    };
    "/api/v1/settings": {
        request: z.ZodObject<{
            paginationDirection: z.ZodDefault<z.ZodEnum<["forwards", "backwards"]>>;
            paginationCursor: z.ZodOptional<z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>>;
            filters: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
            sorting: z.ZodArray<z.ZodTuple<[z.ZodLiteral<"fake_sort">, z.ZodEnum<["ASC", "DESC"]>, z.ZodNull], null>, "many">;
            paginationLimit: z.ZodDefault<z.ZodNumber>;
        }, "strict", z.ZodTypeAny, {
            paginationCursor?: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null | undefined;
            paginationDirection: "forwards" | "backwards";
            filters: {};
            sorting: ["fake_sort", "ASC" | "DESC", null][];
            paginationLimit: number;
        }, {
            paginationDirection?: "forwards" | "backwards" | undefined;
            paginationCursor?: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null | undefined;
            paginationLimit?: number | undefined;
            filters: {};
            sorting: ["fake_sort", "ASC" | "DESC", null][];
        }>;
        response: z.ZodObject<{
            entities: z.ZodArray<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>, "many">;
            previousCursor: z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>;
            nextCursor: z.ZodNullable<z.ZodObject<{
                open_date: z.ZodString;
                voting_start_date: z.ZodString;
                voting_end_date: z.ZodString;
                results_date: z.ZodString;
            }, "strict", z.ZodTypeAny, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }, {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }>>;
        }, "strict", z.ZodTypeAny, {
            entities: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }[];
            previousCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
            nextCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
        }, {
            entities: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            }[];
            previousCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
            nextCursor: {
                open_date: string;
                voting_start_date: string;
                voting_end_date: string;
                results_date: string;
            } | null;
        }>;
    };
}[P]["request"]>) => Promise<ResponseType<P>>;
export declare class PwEntityList<P extends keyof typeof entityRoutes, X extends string> extends PwForm<P> {
    static get properties(): {
        task: {
            attribute: boolean;
            hasChanged: () => boolean;
        };
        initial: {
            attribute: boolean;
        };
        debouncedUrl: {
            state: boolean;
        };
        prefix: {
            attribute: boolean;
        };
        disabled: {
            type: BooleanConstructor;
        };
        url: {
            attribute: boolean;
        };
    };
    connectedCallback(): void;
    static styles: import("lit").CSSResult;
    defaultValue: z.infer<typeof entityRoutes[P]["request"]>;
    get title(): string;
    get buttons(): TemplateResult;
    get head(): TemplateResult;
    get body(): TemplateResult;
    get actionText(): string;
    initial?: ResponseType<P>;
    protected history: HistoryController;
    prefix: X;
    constructor();
    render(): TemplateResult<1>;
}
