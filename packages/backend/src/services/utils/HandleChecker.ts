import OrganizationsContext from "@floro/database/src/contexts/organizations/OrganizationsContext";
import UsersContext from "@floro/database/src/contexts/users/UsersContext";

export default class HandleChecker {
  private usersContext: UsersContext;
  private organizationsContext: OrganizationsContext;
  constructor(
    usersContext: UsersContext,
    organizationsContext: OrganizationsContext
  ) {
    this.usersContext = usersContext;
    this.organizationsContext = organizationsContext;
  }

  public async usernameOrHandleTaken(handle: string): Promise<boolean> {
    const usernameTaken = await this.usersContext.usernameExists(handle);
    if (usernameTaken) return true;
    const handleTaken = await this.organizationsContext.handleExists(handle);
    if (handleTaken) return true;
    return false;
  }
}
