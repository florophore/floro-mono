import { DataSource , DataSourceOptions } from 'typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

const defaultOptions: DataSourceOptions = {
  type: 'postgres',
  host: 'localhost',
  port: 5432,
  username: 'postgres',
  password: '',
  synchronize: false,
  logging: true,
  entities: ["src/entities/**/*.ts"],
  migrations: ["src/migrations/**/*.ts"],
  subscribers: ["src/subscribers/**/*.ts"],
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