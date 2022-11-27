import {
    PrimaryColumn,
    BeforeInsert,
    BaseEntity,
    UpdateDateColumn,
    CreateDateColumn,
    BeforeUpdate
} from "typeorm";
import { v4 as uuidv4 } from 'uuid';
import { validateOrReject } from 'class-validator';

export class BinaryPKBaseEntity extends BaseEntity {

  @PrimaryColumn()
  id!: string;

  @BeforeInsert()
  addId() {
    this.id = uuidv4();
  }

  @CreateDateColumn({ name: "created_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)" })
  public createdAt!: any;

  @UpdateDateColumn({ name: "updated_at", type: "timestamp", default: () => "CURRENT_TIMESTAMP(6)", onUpdate: "CURRENT_TIMESTAMP(6)" })
  public updatedAt!: any;

  @BeforeInsert()
  @BeforeUpdate()
  public validate(): Promise<void> {
    return validateOrReject(this);
  }
}