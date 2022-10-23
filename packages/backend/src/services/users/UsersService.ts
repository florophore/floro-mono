import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import UserAuthCredentialsContext from "@floro/database/src/contexts/authentication/UserAuthCredentialsContext";
import { User } from "@floro/database/src/entities/User";
import { UserAuthCredential } from "@floro/database/src/entities/UserAuthCredential";


@injectable()
export default class UsersService {

    private databaseConnection!: DatabaseConnection;
    private contextFactory!: ContextFactory;

    constructor(
        @inject(DatabaseConnection) databaseConnection: DatabaseConnection,
        @inject(ContextFactory) contextFactory: ContextFactory
        ) {
        this.databaseConnection = databaseConnection;
        this.contextFactory = contextFactory;
    }

    public async checkUsernameIsTaken(username: string): Promise<boolean> { 
        const usersContext = await this.contextFactory.createContext(UsersContext);
        return await usersContext.usernameExists(username);
    }
}