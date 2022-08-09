import main from '../src/main/schema';
import { ApolloServer } from 'apollo-server';
import { v4 as uuidv4 } from 'uuid';

describe('MainSchema', () => {
    
    const mockUsers = [{
        id: uuidv4(),
        firstName: "foo",
        lastName:  "bar",
        username:  "doggylover"
    }]

    describe('Query',  () => {

        test('users returns [User]', async () => {
            const resolvers = {
                Query: {
                    users: () => mockUsers,
                },
            };
            const variables = {};

            const testServer = new ApolloServer({
                typeDefs: main,
                resolvers
              });
            
            const result = await testServer.executeOperation({
                query:
                `query UsersQuery { 
                    users {
                        id,
                        username,
                        firstName,
                        lastName
                    }
                }`,
                variables,
            });
            expect(result.data).toEqual({users: mockUsers});
        });
    });
});