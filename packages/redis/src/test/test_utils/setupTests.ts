import DatabaseConnectionFactory from '../../connection/DatabaseConnectionFactory';
import container from './testContainer'

global.dbFactory = container.get(DatabaseConnectionFactory);

export const dbBeforeEach = async (): Promise<void> => {
    const dbConn = await global.dbFactory.create();
    await dbConn.open();
    await dbConn.migrate();
} ;

export const dbAfterEach = async (): Promise<void> => {
    const dbConn = await global.dbFactory.create();
    await dbConn.close();
} ;

global.beforeEach(dbBeforeEach);

global.afterEach(dbAfterEach);