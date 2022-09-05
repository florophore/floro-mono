import { injectable } from 'inversify';
import { env } from 'process';

const isDev = env.NODE_PROCESS = 'development';
const isTest = env.NODE_PROCESS = 'test';

@injectable()
export default class MailerClientConfig {


}