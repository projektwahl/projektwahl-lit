export declare function hashPassword(password: string): Promise<string>;
export declare function checkPassword(hash: string, password: string): Promise<[boolean, boolean, string]>;
