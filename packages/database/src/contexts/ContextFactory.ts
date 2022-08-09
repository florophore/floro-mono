import { inject, injectable } from "inversify";
import DatabaseConnection from "../connection/DatabaseConnection";
import BaseContext from "./BaseContext";

@injectable()
export default class ContextFactory {
    protected conn!: DatabaseConnection;

    public constructor(
        @inject(DatabaseConnection) connection: DatabaseConnection
    ) {
            this.conn = connection;
    }

    public async createContext<T extends BaseContext>(constructorClass: {
         new (conn: DatabaseConnection): T 
        }): Promise<T> {
        const context = new constructorClass(this.conn);
        await context.init();
        return context;
    }
}