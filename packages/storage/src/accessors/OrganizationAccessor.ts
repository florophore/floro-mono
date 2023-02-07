import { Organization } from '@floro/database/src/entities/Organization';
import { injectable, inject } from 'inversify';
import StorageDriver from '../drivers/StrorageDriver';
import StorageClient from '../StorageClient';
import path from 'path';

@injectable()
export default class OrganizationAccessor {
    private driver!: StorageDriver; 

    constructor(
        @inject(StorageClient) storageClient: StorageClient
    ) {
        this.driver = storageClient.publicDriver;
    }

    public orgDirectory(org: Organization) {
        return path.join(this.driver.staticRoot?.() ?? "", "orgs", org.id);
    }

    public async makeUserDirectory(org: Organization) {
        const exists = await this.driver.exists(this.orgDirectory(org));
        if (!exists) {
            await this.driver.mkdir(this.orgDirectory(org));
        }
    }

    public async makePhotoPath(org: Organization) {
        const exists = await this.driver.exists(path.join(this.orgDirectory(org), "photos"));
        if (!exists) {
            await this.driver.mkdir(path.join(this.orgDirectory(org), "photos"));
        }
    }

    public getPhotoPath(org: Organization, hash: string, mimeType: "png"|"jpeg" = "png") {
        if (mimeType == "png") {
            return path.join(this.orgDirectory(org), "photos", `${hash}.png`);
        }
        return path.join(this.orgDirectory(org), "photos", `${hash}.jpeg`);
    }

    public getPhotoPathFromRoot(org: Organization, hash: string, mimeType: "png"|"jpeg" = "png") {
        return this.getPhotoPath(org, hash, mimeType).substring((this.driver.staticRoot?.() ?? "").length)
    }

    public async writePhoto(org: Organization, hash: string, image: Buffer, mimeType: "png"|"jpeg" = "png") {
        await this.makePhotoPath(org);
        const filePath = this.getPhotoPath(org, hash, mimeType);
        this.driver.write(filePath, image);
        return null;
    }
}