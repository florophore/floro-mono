import "reflect-metadata"

import { ContainerModule } from 'inversify';
import ContextFactory from './contexts/ContextFactory';
import DatabaseConnectionFactory from "./connection/DatabaseConnectionFactory";
import DatabaseConnection from "./connection/DatabaseConnection";
import datasource from "./datasource";
import { DataSource } from "typeorm";

export default new ContainerModule((bind): void => {
    bind<DataSource>(DataSource).toConstantValue(datasource);
    bind<DatabaseConnection>(DatabaseConnection).toSelf();
    bind<DatabaseConnectionFactory>(DatabaseConnectionFactory).toSelf().inSingletonScope();
    bind<ContextFactory>(ContextFactory).toSelf().inSingletonScope();
});