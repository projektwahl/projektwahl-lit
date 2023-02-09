import { Client } from "openid-client";
declare let client: Client | null;
declare function setupClient(): Promise<void>;
export { setupClient, client };
