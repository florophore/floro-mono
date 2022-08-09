import * as path from 'path';
import { Builder, fixturesIterator, Loader, Parser, Resolver } from 'typeorm-fixtures-cli/dist';
import container from './testContainer';
import DatabaseConnection from '../connection/DatabaseConnection';
import { BaseEntity } from 'typeorm';

export const loadFixtures = async <T extends BaseEntity> (fixtureNames: string[]): Promise<T[]> => {
  const out: T[] = [];
  const dbConn = container.get(DatabaseConnection);
  const loader = new Loader();
  loader.load(path.resolve('./fixtures'));

  const resolver = new Resolver();
  const fixtures = resolver.resolve(loader.fixtureConfigs);
  const builder = new Builder(dbConn.datasource, new Parser(), false);

  for (const fixture of fixturesIterator(fixtures)) {
    if (fixtureNames.includes(`${fixture.entity}:${fixture.name}`)) {
      const entity = await builder.build(fixture);
      const repo = dbConn.datasource.getRepository(fixture.entity);
      const outEntity = await repo.save(entity);
      out.push(outEntity as T);
    }
  }
  if (fixtureNames.length != out.length) {
    throw new Error("Invalid fixures loaded in: " + JSON.stringify(fixtureNames));
  }
  return out;
};