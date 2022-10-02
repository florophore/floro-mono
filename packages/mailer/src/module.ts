import { ContainerModule } from 'inversify';
import MailerClientConfig from './MailerClientConfig';
import MailerClient from './MailerClient';

export default new ContainerModule((bind): void => {
    bind<MailerClientConfig>(MailerClientConfig).toSelf().inSingletonScope();
    bind<MailerClient>(MailerClient).toSelf().inSingletonScope();
});