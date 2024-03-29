import { injectable, inject } from 'inversify';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import { User } from "@floro/database/src/entities/User";
import path from 'path';
import DiskStorageDriver from '../drivers/DiskStorageDriver';

@injectable()
export default class UserAccessor {
    private driver!: StorageDriver;

    constructor(
        @inject(StorageClient) storageClient: StorageClient
    ) {
        this.driver = storageClient.publicDriver;
    }

    public userDirectory(user: User) {
        const userDir = path.join(this.driver.staticRoot?.() ?? "", "users", user.id);
        if (userDir[0] == "/") {
            return userDir;
        }
        return `/${userDir}`;
    }

    public async makeUserDirectory(user: User) {
        if (this.driver instanceof DiskStorageDriver) {
            const exists = await this.driver.exists(this.userDirectory(user));
            if (!exists) {
                await this.driver.mkdir(this.userDirectory(user));
            }
        }
    }

    public async makePhotoPath(user: User) {
        if (this.driver instanceof DiskStorageDriver) {
            const exists = await this.driver.exists(path.join(this.userDirectory(user), "photos"));
            if (!exists) {
                await this.driver.mkdir(path.join(this.userDirectory(user), "photos"));
            }
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
        if (this.driver instanceof DiskStorageDriver) {
            await this.makePhotoPath(user);
        }
        const filePath = this.getPhotoPath(user, hash, mimeType);
        this.driver.write(filePath, image);
        return null;
    }
}