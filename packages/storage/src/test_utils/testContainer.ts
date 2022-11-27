import "reflect-metadata"

import { Container } from "inversify";
import StorageModule from '../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
});

container.load(
  StorageModule
);

export default container;