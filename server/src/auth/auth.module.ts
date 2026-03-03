import { Module } from '@nestjs/common';
import { MulterModule } from '@nestjs/platform-express';
import { memoryStorage } from 'multer';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { SessionService } from './session.service';
import { SignInService } from './sign-in.service';
import { SignInController, PointsController } from './sign-in.controller';

@Module({
  imports: [
    MulterModule.register({
      storage: memoryStorage(),
      limits: {
        fileSize: 10 * 1024 * 1024, // 10MB
      },
    }),
  ],
  controllers: [AuthController, SignInController, PointsController],
  providers: [AuthService, SessionService, SignInService],
  exports: [AuthService, SessionService, SignInService],
})
export class AuthModule {}
