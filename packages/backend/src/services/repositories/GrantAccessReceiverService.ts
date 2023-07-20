import { injectable } from "inversify";

import { User } from "@floro/database/src/entities/User";
import { Repository } from "@floro/database/src/entities/Repository";
import GrantRepoAccessHandler from "../events/GrantRepoAccessHandler";

@injectable()
export default class GrantAccessReceiverService implements GrantRepoAccessHandler {
    public async onGrantReadAccess(repo: Repository, grantedByUser: User, toUser: User): Promise<void> {
        //console.log("implement me")
    }
    public async onGrantWriteAccess(repo: Repository, grantedByUser: User, toUser: User): Promise<void> {
        //console.log("implement me")
    }
}