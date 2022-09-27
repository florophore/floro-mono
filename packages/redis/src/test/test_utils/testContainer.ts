import "reflect-metadata"

import DBModule from "@floro/database/src/module";
import { Container } from "inversify";

import RedisModule from '../../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
})

container.load(RedisModule, DBModule);

export default container;