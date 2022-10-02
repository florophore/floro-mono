import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_ENV === 'development';
const isTest = env.NODE_ENV === 'test';

@injectable()
export default class MailerClientConfig {


}