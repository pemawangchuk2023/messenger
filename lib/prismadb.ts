
/**
 * The purpose of this code is to set up a single,
 *  reusable instance of the Prisma client that allows
 *  your application to interact with a PostgreSQL
 *  database efficiently.
 */
import {PrismaClient} from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var prisma: PrismaClient | undefined;
}
const client = globalThis.prisma || new PrismaClient();
if(process.env.NODE_ENV !== "production") globalThis.prisma = client;
export default client;
