import { Injectable } from '@nestjs/common';
import {Roles} from "./roles.entity"
import { TypeOrmCrudService } from '@nestjsx/crud-typeorm';
import { InjectRepository } from '@nestjs/typeorm';
@Injectable()
export class RolesService  extends TypeOrmCrudService<Roles> {
    constructor(
        @InjectRepository(Roles) repo,
    ) {
        super(repo)
    }
}
