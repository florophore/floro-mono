import "reflect-metadata"

import { Container } from "inversify";
import ThirdPartyServicesModule from '../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
});

container.load(
  ThirdPartyServicesModule
);

export default container;