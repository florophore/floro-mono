import { inject, injectable } from "inversify";
import { DataSource } from "typeorm";

@injectable()
export default class DatabaseConnection {
    public datasource: DataSource;

    constructor(@inject(DataSource) datasource: DataSource) {
        this.datasource = datasource;
    }

    public async open(): Promise<void> {
        await this.datasource.initialize();
    }

    /**
     * we only use this for testing.
     */
    public async close(): Promise<void> {
        await this.datasource.destroy();
    }

    public async migrate(): Promise<void> {
        await this.datasource.runMigrations();
    }
}