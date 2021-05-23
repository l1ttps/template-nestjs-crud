import { EntityRepository, Repository } from "typeorm";
import { Roles } from "./roles.entity";

@EntityRepository(Roles)
export class RolesRepository extends Repository<Roles> {

}
