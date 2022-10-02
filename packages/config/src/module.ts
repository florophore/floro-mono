import { ContainerModule } from 'inversify';
import AdminConfig from './AdminConfig';
import MainConfig from './MainConfig';

export default new ContainerModule((bind): void => {
    bind<MainConfig>(MainConfig).toSelf();
    bind<AdminConfig>(AdminConfig).toSelf();
});