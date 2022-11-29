import { injectable, inject } from 'inversify';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import { User } from "@floro/database/src/entities/User";
import path from 'path';
import fs from 'fs';

@injectable()
export default class UserAccessor {
    private driver!: StorageDriver; 

    constructor(
        @inject(StorageClient) storageClient: StorageClient
    ) {
        this.driver = storageClient.driver;
    }

    public userDirectory(user: User) {
        return path.join(this.driver.staticRoot?.() ?? "", "users", user.id)
    }

    public async makeUserDirectory(user: User) {
        const exists = await this.driver.exists(this.userDirectory(user));
        if (!exists) {
            await fs.promises.mkdir(this.userDirectory(user), { recursive: true})
        }
    }
    public async makePhotoPath(user: User) {
        const exists = await this.driver.exists(path.join(this.userDirectory(user), "photos"));
        if (!exists) {
            await fs.promises.mkdir(path.join(this.userDirectory(user), "photos"), { recursive: true})
        }
    }

    public getPhotoPath(user: User, hash: string, mimeType: "png"|"jpeg" = "png") {
        if (mimeType == "png") {
            return path.join(this.userDirectory(user), "photos", `${hash}.png`);
        }
        return path.join(this.userDirectory(user), "photos", `${hash}.jpeg`);
    }

    public getPhotoPathFromRoot(user: User, hash: string, mimeType: "png"|"jpeg" = "png") {
        return this.getPhotoPath(user, hash, mimeType).substring((this.driver.staticRoot?.() ?? "").length)
    }

    public async writePhoto(user: User, hash: string, image: Buffer, mimeType: "png"|"jpeg" = "png") {
        await this.makePhotoPath(user);
        const filePath = this.getPhotoPath(user, hash, mimeType);
        this.driver.write(filePath, image);
        return null;
    }
}