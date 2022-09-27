import container from './testContainer';
import { dbBeforeEach, dbAfterEach } from './setupTests';

global.beforeEach(dbBeforeEach(container));

global.afterEach(dbAfterEach(container));