import DatabaseConnectionFactory from '../connection/DatabaseConnectionFactory';
import container from './testContainer'

global.dbFactory = container.get(DatabaseConnectionFactory);

global.beforeEach(async (): Promise<void> => {
    const dbConn = await global.dbFactory.create();
    await dbConn.open();
    await dbConn.migrate();
});

global.afterEach(async (): Promise<void> => {
    const dbConn = await global.dbFactory.create();
    await dbConn.close();
});