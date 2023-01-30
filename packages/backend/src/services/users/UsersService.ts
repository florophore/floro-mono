import { injectable, inject } from "inversify";

import DatabaseConnection from "@floro/database/src/connection/DatabaseConnection";
import ContextFactory from "@floro/database/src/contexts/ContextFactory";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";
import { User } from "@floro/database/src/entities/User";
import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import HandleChecker from "../utils/HandleChecker";
import { NAME_REGEX } from "@floro/common-web/src/utils/validators";

export interface UpdateUserNameResponse {
  action: "UPDATE_USER_NAME_SUCCEEDED" | "INVALID_PARAMS" | "LOG_ERROR";
  user?: User;
  error?: {
    type: string;
    message: string;
    meta?: unknown;
  };
}

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
    const organizationsContext = await this.contextFactory.createContext(
      OrganizationsContext
    );
    const handleChecker = new HandleChecker(usersContext, organizationsContext);
    return await handleChecker.usernameOrHandleTaken(username);
  }

  public async updateUserName(
    currentUser: User,
    firstName?: string|null,
    lastName?: string|null
  ): Promise<UpdateUserNameResponse> {
    if (!firstName || !lastName) {
      return {
        action: "INVALID_PARAMS",
        error: {
          type: "INVALID_PARAMS",
          message: "User missing first name or last name",
        },
      };
    }
    if (!NAME_REGEX.test(firstName)) {
      return {
        action: "INVALID_PARAMS",
        error: {
          type: "INVALID_PARAMS",
          message: "Invalid first name",
        },
      };
    }

    if (!NAME_REGEX.test(lastName)) {
      return {
        action: "INVALID_PARAMS",
        error: {
          type: "INVALID_PARAMS",
          message: "Invalid last name",
        },
      };
    }
    const usersContext = await this.contextFactory.createContext(UsersContext);
    const user = await usersContext.updateUser(currentUser, {
      firstName,
      lastName,
    });
    return {
      action: "UPDATE_USER_NAME_SUCCEEDED",
      user,
    };
  }
}
