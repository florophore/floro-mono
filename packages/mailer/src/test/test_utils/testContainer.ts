import "reflect-metadata"

import { Container, ContainerModule } from "inversify";

import MailerModule from '../../module';
import MockTransport from "./MockTransport";

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
});

export const mockMailerDeps = new ContainerModule((bind): void => {
    bind<MockTransport>(MockTransport).toSelf().inSingletonScope();
});

container.load(mockMailerDeps, MailerModule);

export default container;