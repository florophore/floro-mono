import "reflect-metadata"

import { Container } from "inversify";

import DBModule from "@floro/database/src/module";
import MainConfigModule from "@floro/main-config/src/module";
import MailerModule from '@floro/mailer/src/module';
import { mockMailerDeps } from '@floro/mailer/src/test/test_utils/testContainer';
import RedisModule from '../../module';

const container: Container = new Container({
    autoBindInjectable: true,
    defaultScope: 'Singleton',
})

container.load(MainConfigModule, RedisModule, DBModule, mockMailerDeps, MailerModule);

export default container;