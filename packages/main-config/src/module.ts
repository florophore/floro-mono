import { ContainerModule } from 'inversify';
import MainConfig from './MainConfig';

export default new ContainerModule((bind): void => {
    bind<MainConfig>(MainConfig).toSelf();
});