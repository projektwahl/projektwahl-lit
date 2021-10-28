export declare type New<T> = T & {
    id?: number;
};
export declare type Existing<T> = T & {
    id: number;
};
export declare type RawUserType = {
    username: string;
    password: string;
    type: "helper" | "admin" | "voter";
    group: string;
    age: number;
    away: boolean;
    project_leader_id: number | null;
    force_in_project_id: number | null;
};
export declare type RawProjectType = {
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
export declare type RawSessionType = {
    session_id: string;
    created_at: Date;
    updated_at: Date;
    user_id: number;
};
export declare type RawChoiceType = {
    user_id: number;
    project_id: number;
    rank: number;
};
export declare type ResettableChoiceType = {
    user_id: number;
    project_id: number;
    rank: number | null;
};
export declare type EntityResponseBody<T> = {
    entities: Array<T>;
    previousCursor: T | null;
    nextCursor: T | null;
};
//# sourceMappingURL=types.d.ts.map