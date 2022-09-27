import { Container } from 'inversify';
import DatabaseConnectionFactory from '../../connection/DatabaseConnectionFactory';


export const dbBeforeEach = (container: Container) => async (): Promise<void> => {
    const dbFactory = container.get(DatabaseConnectionFactory);
    const dbConn = dbFactory.create();
    await dbConn.open();
    await dbConn.migrate();
} ;

export const dbAfterEach = (container: Container) => async (): Promise<void> => {
    const dbFactory = container.get(DatabaseConnectionFactory);
    const dbConn = dbFactory.create();
    await dbConn.close();
} ;