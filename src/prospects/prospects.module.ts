import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { Prospect, ProspectSchema } from './schemas/prospect.schema';
import { UserMember, UserMemberSchema } from '../rbac/schemas/rbac.schema';
import { ProspectsController } from './prospects.controller';
import { ProspectsService } from './prospects.service';

@Module({
  imports: [
    MongooseModule.forFeature([
      { name: Prospect.name, schema: ProspectSchema },
      { name: UserMember.name, schema: UserMemberSchema },
    ]),
  ],
  controllers: [ProspectsController],
  providers: [ProspectsService],
  exports: [ProspectsService, MongooseModule],
})
export class ProspectsModule {}
