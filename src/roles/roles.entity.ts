import { Entity, PrimaryGeneratedColumn, Column, OneToMany } from "typeorm";
import * as randToken from 'rand-token';
import { Account } from "src/account/account.entity";

@Entity({ name: 'roles' })
export class Roles {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    name: string;

    @Column({default: randToken.generate(6)})
    key: string;

    @Column({default: new Date()})
    createAt: Date;

    @OneToMany(type => Account, account => account.role)
    account_ids: Account[];

}
