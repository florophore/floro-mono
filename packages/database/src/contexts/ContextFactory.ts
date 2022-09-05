import { inject, injectable } from "inversify";
import { QueryRunner } from "typeorm";
import DatabaseConnection from "../connection/DatabaseConnection";
import BaseContext from "./BaseContext";

@injectable()
export default class ContextFactory {
  protected conn!: DatabaseConnection;
  protected warmQueryRunner!: QueryRunner;

  public constructor(
    @inject(DatabaseConnection) connection: DatabaseConnection
  ) {
    this.conn = connection;
  }

  public async warmQueryRunnerConnection(): Promise<void> {
    if (!this.warmQueryRunner) {
      this.warmQueryRunner = await this.conn.makeQueryRunner();
    }
  }

  public async createContext<T extends BaseContext>(
    constructorClass: {
      new (conn: DatabaseConnection): T;
    },
    queryRunner?: QueryRunner
  ): Promise<T> {
    const context = new constructorClass(this.conn);
    if (queryRunner) {
      await context.init(queryRunner, this);
      return context;
    }
    await this.warmQueryRunnerConnection();
    await context.init(this.warmQueryRunner, this);
    return context;
  }
}
