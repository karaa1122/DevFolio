import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PortfolioService } from './portfolio.service';
import { PortfolioController } from './portfolio.controller';
import { Portfolio } from '../../database/entities/portfolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Portfolio])],
  controllers: [PortfolioController],
  providers: [PortfolioService],
  exports: [PortfolioService],
})
export class PortfolioModule {}
