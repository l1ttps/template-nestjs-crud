import { Entity, PrimaryGeneratedColumn, Column, OneToMany, ManyToOne, OneToOne, JoinColumn } from "typeorm";
import * as bcrypt from 'bcrypt';
import { Roles } from "src/roles/roles.entity";
import * as randToken from "rand-token"
@Entity({ name: 'account' })
export class Account {
    @PrimaryGeneratedColumn()
    id: number;

    // @Column({ nullable: false, default: randToken.generate(32) })
    // uid: string;

    @Column({ nullable: true, unique: true })
    email: string;

    @Column()
    phone: string;

    @Column({ unique: true })
    username: string;

    @Column({ nullable: true })
    firstName: string;

    @Column({ nullable: true })
    lastName: string;

    @Column()
    password: string;

    @Column()
    salt: string;

    @Column({ nullable: true })
    roleId: number;

    @Column({ nullable: true })
    secretKeyJwt: string;

    @Column({ default: false })
    emailVerified: boolean;

    @Column({ default: false })
    phoneNumberVerified: boolean;

    @Column({ nullable: true, default: false })
    isActive: boolean;

    @ManyToOne(type => Roles, roles => roles.account_ids)
    role: number;

    @Column({ default: false })
    isArchive: boolean;


    async validatePassword(password: string): Promise<boolean> {
        const hash = await bcrypt.hash(password, this.salt);
        return hash === this.password;
    }

}
