import { Controller, Post } from '@nestjs/common';
import { AdminService } from './admin.service';

@Controller('admin')
export class AdminInitCasesController {
  constructor(private readonly adminService: AdminService) {}

  @Post('init-medical-cases')
  async initMedicalCases() {
    return await this.adminService.initMedicalCases();
  }
}
