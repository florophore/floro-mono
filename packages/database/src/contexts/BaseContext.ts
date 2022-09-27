import { ObjectLiteral, QueryBuilder, QueryRunner } from "typeorm";
import DatabaseConnection from "../connection/DatabaseConnection";
import ContextFactory from "./ContextFactory";

export default abstract class BaseContext {
  protected conn!: DatabaseConnection;
  protected queryRunner!: QueryRunner;
  protected contextFactory!: ContextFactory;

  constructor(conn: DatabaseConnection) {
    this.conn = conn;
  }

  public async init(
    queryRunner: QueryRunner,
    contextFactory: ContextFactory
  ): Promise<void> {
    this.queryRunner = queryRunner;
    this.contextFactory = contextFactory;
  }

  protected queryBuilder<T extends ObjectLiteral>(
    queryRunner?: QueryRunner | undefined
  ): QueryBuilder<T> {
    return this.queryRunner.manager.createQueryBuilder(queryRunner);
  }
}
