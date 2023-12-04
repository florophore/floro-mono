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
  logging: false, // change to true later
  entities: [__dirname + "/entities/**/*.{ts,js}"],
  migrations: [__dirname + "/migrations/**/*.{ts,js}"],
  subscribers: [__dirname + "/subscribers/**/*.{ts,js}"],
  namingStrategy: new SnakeNamingStrategy(),
}

const devDataSource = new DataSource({
  ...defaultOptions,
  database: "floro_dev",
  logging: false
});

const testDataSource = new DataSource({
  ...defaultOptions,
  database: "floro_test",
  username: 'postgres',
  password: '',
  logging: false,
  dropSchema: true
});


const parseDBPoolSize = (): number => {
  try {
    const rawDbPoolSize = process.env?.['DB_POOL_SIZE'];
    if (!rawDbPoolSize) {
      return 20;
    }
    if (typeof rawDbPoolSize == "string") {
      return parseInt(rawDbPoolSize);
    }
    if (typeof rawDbPoolSize == "number") {
      return rawDbPoolSize;
    }
    return 20;
  } catch(e) {
      return 20;
  }
}

const prodDataSource = new DataSource({
  ...defaultOptions,
  host: process.env?.['POSTGRES_HOST'],
  database: process.env?.['POSTGRES_DB_NAME'],
  username: process.env?.['POSTGRES_USER'],
  password: process.env?.['POSTGRES_PASSWORD'],
  logging: true,
  poolSize: parseDBPoolSize()
});

export default ((env = 'development'): DataSource => {
  switch (env) {
    case 'test':
      return testDataSource;
    case 'production':
      return prodDataSource;
    default:
      return devDataSource;
  }
})(process?.env.NODE_ENV as string);