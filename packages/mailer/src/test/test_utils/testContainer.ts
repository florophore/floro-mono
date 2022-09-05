import "reflect-metadata"

import { Container } from "inversify";

import RedisModule from '../../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
})

container.load(RedisModule);

export default container;