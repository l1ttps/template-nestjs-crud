import { Module } from '@nestjs/common';
import { RolesController } from './roles.controller';
import { RolesService } from './roles.service';
import { RolesRepository } from './roles.repository';
import { TypeOrmModule } from '@nestjs/typeorm';

@Module({
  imports: [ TypeOrmModule.forFeature([RolesRepository])],
  controllers: [RolesController],
  providers: [RolesService],
  exports: [RolesService]
})
export class RoleModule {}
