import { ContainerModule } from 'inversify';
import MailerClientConfig from './MailerClientConfig';

export default new ContainerModule((bind): void => {
    bind<MailerClientConfig>(MailerClientConfig).toSelf();
});