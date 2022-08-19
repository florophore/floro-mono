import DatabaseConnection from "../connection/DatabaseConnection";

export default abstract class BaseContext {
    protected conn!: DatabaseConnection;

    constructor(conn: DatabaseConnection) {
        this.conn = conn;
    }

    public abstract init(): Promise<void>;
}