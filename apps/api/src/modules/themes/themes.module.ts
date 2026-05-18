import { Module } from '@nestjs/common';
import { ThemesService } from './themes.service';
import { ThemesController } from './themes.controller';

@Module({
  controllers: [ThemesController],
  providers: [ThemesService],
  exports: [ThemesService],
})
export class ThemesModule {}
