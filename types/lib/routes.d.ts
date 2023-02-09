/*!
https://github.com/projektwahl/projektwahl-lit
SPDX-License-Identifier: AGPL-3.0-or-later
SPDX-FileCopyrightText: 2021 Moritz Hedtke <Moritz.Hedtke@t-online.de>
*/
import { z, ZodIssue, ZodObject } from "zod";
export declare const rawChoice: z.ZodObject<{
    rank: z.ZodNumber;
    project_id: z.ZodNumber;
    user_id: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    rank: number;
    project_id: number;
    user_id: number;
}, {
    rank: number;
    project_id: number;
    user_id: number;
}>;
export declare const rawChoiceNullable: z.ZodObject<{
    rank: z.ZodNullable<z.ZodNumber>;
    project_id: z.ZodNullable<z.ZodNumber>;
    user_id: z.ZodNullable<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    rank: number | null;
    project_id: number | null;
    user_id: number | null;
}, {
    rank: number | null;
    project_id: number | null;
    user_id: number | null;
}>;
export declare const rawUserSchema: z.ZodObject<{
    id: z.ZodNumber;
    username: z.ZodString;
    openid_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    password_hash: z.ZodString;
    away: z.ZodBoolean;
    project_leader_id: z.ZodNullable<z.ZodNumber>;
    password_changed: z.ZodBoolean;
    force_in_project_id: z.ZodNullable<z.ZodNumber>;
    computed_in_project_id: z.ZodNullable<z.ZodNumber>;
    deleted: z.ZodBoolean;
    last_updated_by: z.ZodNumber;
    type: z.ZodEnum<["voter", "helper", "admin"]>;
    group: z.ZodNullable<z.ZodString>;
    age: z.ZodNullable<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    openid_id?: string | null | undefined;
    type: "voter" | "helper" | "admin";
    username: string;
    id: number;
    group: string | null;
    age: number | null;
    password_hash: string;
    away: boolean;
    project_leader_id: number | null;
    password_changed: boolean;
    force_in_project_id: number | null;
    computed_in_project_id: number | null;
    deleted: boolean;
    last_updated_by: number;
}, {
    openid_id?: string | null | undefined;
    type: "voter" | "helper" | "admin";
    username: string;
    id: number;
    group: string | null;
    age: number | null;
    password_hash: string;
    away: boolean;
    project_leader_id: number | null;
    password_changed: boolean;
    force_in_project_id: number | null;
    computed_in_project_id: number | null;
    deleted: boolean;
    last_updated_by: number;
}>;
export declare const rawProjectSchema: z.ZodObject<{
    id: z.ZodNumber;
    title: z.ZodString;
    info: z.ZodString;
    place: z.ZodString;
    costs: z.ZodNumber;
    min_age: z.ZodNumber;
    max_age: z.ZodNumber;
    min_participants: z.ZodNumber;
    max_participants: z.ZodNumber;
    random_assignments: z.ZodBoolean;
    deleted: z.ZodBoolean;
    last_updated_by: z.ZodNumber;
}, "strict", z.ZodTypeAny, {
    title: string;
    id: number;
    deleted: boolean;
    last_updated_by: number;
    info: string;
    place: string;
    costs: number;
    min_age: number;
    max_age: number;
    min_participants: number;
    max_participants: number;
    random_assignments: boolean;
}, {
    title: string;
    id: number;
    deleted: boolean;
    last_updated_by: number;
    info: string;
    place: string;
    costs: number;
    min_age: number;
    max_age: number;
    min_participants: number;
    max_participants: number;
    random_assignments: boolean;
}>;
export declare const rawSessionType: z.ZodObject<{
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
}>;
export declare const userSchema: z.ZodOptional<z.ZodObject<Pick<{
    id: z.ZodNumber;
    username: z.ZodString;
    openid_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    password_hash: z.ZodString;
    away: z.ZodBoolean;
    project_leader_id: z.ZodNullable<z.ZodNumber>;
    password_changed: z.ZodBoolean;
    force_in_project_id: z.ZodNullable<z.ZodNumber>;
    computed_in_project_id: z.ZodNullable<z.ZodNumber>;
    deleted: z.ZodBoolean;
    last_updated_by: z.ZodNumber;
    type: z.ZodEnum<["voter", "helper", "admin"]>;
    group: z.ZodNullable<z.ZodString>;
    age: z.ZodNullable<z.ZodNumber>;
}, "type" | "username" | "id" | "group" | "age">, "strict", z.ZodTypeAny, {
    type: "voter" | "helper" | "admin";
    username: string;
    id: number;
    group: string | null;
    age: number | null;
}, {
    type: "voter" | "helper" | "admin";
    username: string;
    id: number;
    group: string | null;
    age: number | null;
}>>;
export type UnknownKeysParam = "passthrough" | "strict" | "strip";
export declare const entities: <T extends {
    [k: string]: z.ZodTypeAny;
}, UnknownKeys extends UnknownKeysParam = "strip", Catchall extends z.ZodTypeAny = z.ZodTypeAny>(entity: z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>) => z.ZodUnion<[z.ZodObject<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }> extends infer T_1 extends object ? { [k in keyof T_1]: z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }>[k]; } : never, z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }>[k_1]; } : never>;
}, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }> extends infer T_1 extends object ? { [k in keyof T_1]: z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }>[k]; } : never, z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }>[k_1]; } : never>;
}> extends infer T_3 extends object ? { [k_2 in keyof T_3]: z.baseObjectOutputType<{
    success: z.ZodLiteral<true>;
    data: z.ZodObject<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }, "strict", z.ZodTypeAny, z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }> extends infer T_1 extends object ? { [k in keyof T_1]: z.baseObjectOutputType<{
        entities: z.ZodArray<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>, "many">;
        previousCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
        nextCursor: z.ZodNullable<z.ZodObject<T, UnknownKeys, Catchall, z.objectOutputType<T, Catchall>, z.objectInputType<T, Catchall>>>;
    }>[k]; } : never, z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }>[k_1]; } : never>;
}>[k_2]; } : never, z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }>[k_1]; } : never;
}> extends infer T_4 extends object ? { [k_3 in keyof T_4]: z.objectUtil.addQuestionMarks<{
    success: true;
    data: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }> extends infer T_2 extends object ? { [k_1 in keyof T_2]: z.objectUtil.addQuestionMarks<{
        entities: z.objectInputType<T, Catchall>[];
        previousCursor: z.objectInputType<T, Catchall> | null;
        nextCursor: z.objectInputType<T, Catchall> | null;
    }>[k_1]; } : never;
}>[k_3]; } : never>, z.ZodObject<{
    success: z.ZodLiteral<false>;
    error: z.ZodType<Record<string, string>, z.ZodRecordDef<z.ZodString, z.ZodString>, Record<string, string>>;
}, "strict", z.ZodTypeAny, {
    error: Record<string, string>;
    success: false;
}, {
    error: Record<string, string>;
    success: false;
}>]>;
export declare const createUserAction: z.ZodObject<{
    type: z.ZodEnum<["voter", "helper", "admin"]>;
    username: z.ZodString;
    group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    openid_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    away: z.ZodOptional<z.ZodBoolean>;
    deleted: z.ZodOptional<z.ZodBoolean>;
    password: z.ZodOptional<z.ZodString>;
    action: z.ZodLiteral<"create">;
}, "strict", z.ZodTypeAny, {
    password?: string | undefined;
    group?: string | null | undefined;
    age?: number | null | undefined;
    openid_id?: string | null | undefined;
    away?: boolean | undefined;
    deleted?: boolean | undefined;
    type: "voter" | "helper" | "admin";
    username: string;
    action: "create";
}, {
    password?: string | undefined;
    group?: string | null | undefined;
    age?: number | null | undefined;
    openid_id?: string | null | undefined;
    away?: boolean | undefined;
    deleted?: boolean | undefined;
    type: "voter" | "helper" | "admin";
    username: string;
    action: "create";
}>;
export declare const updateUserAction: z.ZodObject<{
    type: z.ZodOptional<z.ZodEnum<["voter", "helper", "admin"]>>;
    username: z.ZodOptional<z.ZodString>;
    password: z.ZodOptional<z.ZodOptional<z.ZodString>>;
    group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
    age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
    away: z.ZodOptional<z.ZodBoolean>;
    project_leader_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
    deleted: z.ZodOptional<z.ZodBoolean>;
    id: z.ZodNumber;
    action: z.ZodLiteral<"update">;
}, "strict", z.ZodTypeAny, {
    type?: "voter" | "helper" | "admin" | undefined;
    username?: string | undefined;
    password?: string | undefined;
    group?: string | null | undefined;
    age?: number | null | undefined;
    openid_id?: string | null | undefined;
    away?: boolean | undefined;
    project_leader_id?: number | null | undefined;
    force_in_project_id?: number | null | undefined;
    computed_in_project_id?: number | null | undefined;
    deleted?: boolean | undefined;
    id: number;
    action: "update";
}, {
    type?: "voter" | "helper" | "admin" | undefined;
    username?: string | undefined;
    password?: string | undefined;
    group?: string | null | undefined;
    age?: number | null | undefined;
    openid_id?: string | null | undefined;
    away?: boolean | undefined;
    project_leader_id?: number | null | undefined;
    force_in_project_id?: number | null | undefined;
    computed_in_project_id?: number | null | undefined;
    deleted?: boolean | undefined;
    id: number;
    action: "update";
}>;
export declare const routes: {
    readonly "/api/v1/logout": {
        readonly request: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/login": {
        readonly request: z.ZodObject<{
            username: z.ZodString;
            password: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            username: string;
            password: string;
        }, {
            username: string;
            password: string;
        }>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/sudo": {
        readonly request: z.ZodObject<{
            id: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            id: number;
        }, {
            id: number;
        }>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/openid-login": {
        readonly request: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/redirect": {
        readonly request: z.ZodObject<{
            session_state: z.ZodString;
            code: z.ZodString;
        }, "strict", z.ZodTypeAny, {
            code: string;
            session_state: string;
        }, {
            code: string;
            session_state: string;
        }>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/sleep": {
        readonly request: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/update": {
        readonly request: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/users/create-or-update": {
        readonly request: z.ZodArray<z.ZodDiscriminatedUnion<"action", [z.ZodObject<{
            type: z.ZodEnum<["voter", "helper", "admin"]>;
            username: z.ZodString;
            group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            openid_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            away: z.ZodOptional<z.ZodBoolean>;
            deleted: z.ZodOptional<z.ZodBoolean>;
            password: z.ZodOptional<z.ZodString>;
            action: z.ZodLiteral<"create">;
        }, "strict", z.ZodTypeAny, {
            password?: string | undefined;
            group?: string | null | undefined;
            age?: number | null | undefined;
            openid_id?: string | null | undefined;
            away?: boolean | undefined;
            deleted?: boolean | undefined;
            type: "voter" | "helper" | "admin";
            username: string;
            action: "create";
        }, {
            password?: string | undefined;
            group?: string | null | undefined;
            age?: number | null | undefined;
            openid_id?: string | null | undefined;
            away?: boolean | undefined;
            deleted?: boolean | undefined;
            type: "voter" | "helper" | "admin";
            username: string;
            action: "create";
        }>, z.ZodObject<{
            type: z.ZodOptional<z.ZodEnum<["voter", "helper", "admin"]>>;
            username: z.ZodOptional<z.ZodString>;
            password: z.ZodOptional<z.ZodOptional<z.ZodString>>;
            group: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            age: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            openid_id: z.ZodOptional<z.ZodOptional<z.ZodNullable<z.ZodString>>>;
            away: z.ZodOptional<z.ZodBoolean>;
            project_leader_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            force_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            computed_in_project_id: z.ZodOptional<z.ZodNullable<z.ZodNumber>>;
            deleted: z.ZodOptional<z.ZodBoolean>;
            id: z.ZodNumber;
            action: z.ZodLiteral<"update">;
        }, "strict", z.ZodTypeAny, {
            type?: "voter" | "helper" | "admin" | undefined;
            username?: string | undefined;
            password?: string | undefined;
            group?: string | null | undefined;
            age?: number | null | undefined;
            openid_id?: string | null | undefined;
            away?: boolean | undefined;
            project_leader_id?: number | null | undefined;
            force_in_project_id?: number | null | undefined;
            computed_in_project_id?: number | null | undefined;
            deleted?: boolean | undefined;
            id: number;
            action: "update";
        }, {
            type?: "voter" | "helper" | "admin" | undefined;
            username?: string | undefined;
            password?: string | undefined;
            group?: string | null | undefined;
            age?: number | null | undefined;
            openid_id?: string | null | undefined;
            away?: boolean | undefined;
            project_leader_id?: number | null | undefined;
            force_in_project_id?: number | null | undefined;
            computed_in_project_id?: number | null | undefined;
            deleted?: boolean | undefined;
            id: number;
            action: "update";
        }>]>, "many">;
        readonly response: z.ZodArray<z.ZodObject<Pick<{
            id: z.ZodNumber;
            username: z.ZodString;
            openid_id: z.ZodOptional<z.ZodNullable<z.ZodString>>;
            password_hash: z.ZodString;
            away: z.ZodBoolean;
            project_leader_id: z.ZodNullable<z.ZodNumber>;
            password_changed: z.ZodBoolean;
            force_in_project_id: z.ZodNullable<z.ZodNumber>;
            computed_in_project_id: z.ZodNullable<z.ZodNumber>;
            deleted: z.ZodBoolean;
            last_updated_by: z.ZodNumber;
            type: z.ZodEnum<["voter", "helper", "admin"]>;
            group: z.ZodNullable<z.ZodString>;
            age: z.ZodNullable<z.ZodNumber>;
        }, "id" | "project_leader_id" | "force_in_project_id">, "strict", z.ZodTypeAny, {
            id: number;
            project_leader_id: number | null;
            force_in_project_id: number | null;
        }, {
            id: number;
            project_leader_id: number | null;
            force_in_project_id: number | null;
        }>, "many">;
    };
    readonly "/api/v1/projects/create": {
        readonly request: z.ZodObject<Pick<{
            id: z.ZodNumber;
            title: z.ZodString;
            info: z.ZodString;
            place: z.ZodString;
            costs: z.ZodNumber;
            min_age: z.ZodNumber;
            max_age: z.ZodNumber;
            min_participants: z.ZodNumber;
            max_participants: z.ZodNumber;
            random_assignments: z.ZodBoolean;
            deleted: z.ZodBoolean;
            last_updated_by: z.ZodNumber;
        }, "title" | "deleted" | "info" | "place" | "costs" | "min_age" | "max_age" | "min_participants" | "max_participants" | "random_assignments">, "strict", z.ZodTypeAny, {
            title: string;
            deleted: boolean;
            info: string;
            place: string;
            costs: number;
            min_age: number;
            max_age: number;
            min_participants: number;
            max_participants: number;
            random_assignments: boolean;
        }, {
            title: string;
            deleted: boolean;
            info: string;
            place: string;
            costs: number;
            min_age: number;
            max_age: number;
            min_participants: number;
            max_participants: number;
            random_assignments: boolean;
        }>;
        readonly response: z.ZodObject<{
            id: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            id: number;
        }, {
            id: number;
        }>;
    };
    readonly "/api/v1/projects/update": {
        readonly request: z.ZodObject<{
            title: z.ZodOptional<z.ZodString>;
            deleted: z.ZodOptional<z.ZodBoolean>;
            info: z.ZodOptional<z.ZodString>;
            place: z.ZodOptional<z.ZodString>;
            costs: z.ZodOptional<z.ZodNumber>;
            min_age: z.ZodOptional<z.ZodNumber>;
            max_age: z.ZodOptional<z.ZodNumber>;
            min_participants: z.ZodOptional<z.ZodNumber>;
            max_participants: z.ZodOptional<z.ZodNumber>;
            random_assignments: z.ZodOptional<z.ZodBoolean>;
            id: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            title?: string | undefined;
            deleted?: boolean | undefined;
            info?: string | undefined;
            place?: string | undefined;
            costs?: number | undefined;
            min_age?: number | undefined;
            max_age?: number | undefined;
            min_participants?: number | undefined;
            max_participants?: number | undefined;
            random_assignments?: boolean | undefined;
            id: number;
        }, {
            title?: string | undefined;
            deleted?: boolean | undefined;
            info?: string | undefined;
            place?: string | undefined;
            costs?: number | undefined;
            min_age?: number | undefined;
            max_age?: number | undefined;
            min_participants?: number | undefined;
            max_participants?: number | undefined;
            random_assignments?: boolean | undefined;
            id: number;
        }>;
        readonly response: z.ZodObject<{
            id: z.ZodNumber;
        }, "strict", z.ZodTypeAny, {
            id: number;
        }, {
            id: number;
        }>;
    };
    readonly "/api/v1/users": {
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
    readonly "/api/v1/projects": {
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
    readonly "/api/v1/choices": {
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
    readonly "/api/v1/choices/update": {
        readonly request: z.ZodObject<Pick<{
            rank: z.ZodNullable<z.ZodNumber>;
            project_id: z.ZodNullable<z.ZodNumber>;
            user_id: z.ZodNullable<z.ZodNumber>;
        }, "rank" | "project_id">, "strict", z.ZodTypeAny, {
            rank: number | null;
            project_id: number | null;
        }, {
            rank: number | null;
            project_id: number | null;
        }>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/settings/update": {
        readonly request: z.ZodObject<{
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
        }>;
        readonly response: z.ZodObject<{}, "strict", z.ZodTypeAny, {}, {}>;
    };
    readonly "/api/v1/sessions": {
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
    readonly "/api/v1/settings": {
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
};
export declare const entityRoutes: {
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
};
export declare class MinimalZodError {
    issues: ZodIssue[];
}
export declare type MinimalSafeParseError = {
    success: false;
    error: MinimalZodError;
};
export type ResponseType<P extends keyof typeof routes> = z.SafeParseSuccess<z.infer<typeof routes[P]["response"]>> | MinimalSafeParseError;
