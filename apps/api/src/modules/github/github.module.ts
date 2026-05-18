import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { User } from '../../database/entities/user.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Portfolio])],
  controllers: [GithubController],
  providers: [GithubService],
  exports: [GithubService],
})
export class GithubModule {}
