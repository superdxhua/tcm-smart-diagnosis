import { Module } from '@nestjs/common';
import { AdminController } from './admin.controller';
import { AdminService } from './admin.service';
import { AdminCreateTablesController } from './admin.create-tables.controller';
import { AdminInitCasesController } from './admin.init-cases.controller';
import { AdminTempController } from './admin.reset-password.controller';
import { AdminAbuseDetectionController } from './admin-abuse-detection.controller';
import { AdminPunishmentController } from './admin-punishment.controller';
import { AuthModule } from '@/auth/auth.module';
import { MedicalCasesModule } from '@/medical-cases/medical-cases.module';
import { TcmModule } from '@/tcm/tcm.module';

@Module({
  imports: [AuthModule, MedicalCasesModule, TcmModule],
  controllers: [AdminController, AdminCreateTablesController, AdminInitCasesController, AdminTempController, AdminAbuseDetectionController, AdminPunishmentController],
  providers: [AdminService],
  exports: [AdminService],
})
export class AdminModule {}
