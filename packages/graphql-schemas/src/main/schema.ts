import * as path from 'path';
import { loadFilesSync } from '@graphql-tools/load-files';
import { mergeTypeDefs } from '@graphql-tools/merge';
import { typeDefs as scalarTypeDefs } from 'graphql-scalars';

const mainTypesArray = loadFilesSync(path.join(__dirname, './**/*.graphql'));

export default mergeTypeDefs([...scalarTypeDefs, ...mainTypesArray]);