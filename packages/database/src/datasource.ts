import { fileURLToPath } from 'url';
import { dirname } from 'path';
import { DataSource , DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);


const defaultOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  synchronize: false,
  logging: true,
  entities: [__dirname + "/entities/**/*.{ts,js}"],
  migrations: [__dirname + "/migrations/**/*.{ts,js}"],
  subscribers: [__dirname + "/subscribers/**/*.{ts,js}"],
  namingStrategy: new SnakeNamingStrategy(),
}

const devDataSource = new DataSource({
  ...defaultOptions,
  database: "floro_dev",
});

const testDataSource = new DataSource({
  ...defaultOptions,
  database: "floro_test",
  logging: false,
  dropSchema: true
});

export default ((env = 'development'): DataSource => {
  switch (env) {
    case 'test':
      return testDataSource;
    default:
      return devDataSource;
  }
})(process.env.NODE_ENV);