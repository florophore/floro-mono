import "reflect-metadata"

import { Container } from "inversify";

import DBModule from '../../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
})

container.load(DBModule);

export default container;