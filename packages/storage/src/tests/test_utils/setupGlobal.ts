import container from './testContainer'
import { storageBeforeEach, storageAfterEach } from './setupTests';

global.beforeEach(storageBeforeEach(container));
global.afterEach(storageAfterEach(container));