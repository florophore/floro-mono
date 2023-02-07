import "reflect-metadata"

import { Container } from "inversify";
import StorageModule from '../../module';
import ConfigModule from '@floro/config/src/module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
});

container.load(
  StorageModule,
  ConfigModule
);

export default container;