import { inject, injectable } from "inversify";
import DatabaseConnection from "./DatabaseConnection";

@injectable()
export default class DatabaseConnectionFactory {
    private connection!: DatabaseConnection;

    constructor(@inject(DatabaseConnection) connection: DatabaseConnection) {
        this.connection = connection;
    }

    public create(): DatabaseConnection {
        return this.connection;
    }
}