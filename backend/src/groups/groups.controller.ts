import { Body, Controller, Get, Param, Put } from '@nestjs/common';
import { GroupsService, SetPermissionsDto } from './groups.service';
import { Auth } from '../auth/decorators/auth.decorator';

@Controller('api/admin/groups')
@Auth('admin.access', 'groups.manage')
export class GroupsController {
  constructor(private readonly groups: GroupsService) {}

  @Get()
  list() {
    return this.groups.list();
  }

  @Put(':key/permissions')
  setPermissions(@Param('key') key: string, @Body() dto: SetPermissionsDto) {
    return this.groups.setPermissions(key, dto);
  }
}
