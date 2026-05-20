import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GithubService } from './github.service';
import { GithubController } from './github.controller';
import { EncryptionService } from '../../common/services/encryption.service';
import { User } from '../../database/entities/user.entity';
import { Portfolio } from '../../database/entities/portfolio.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Portfolio])],
  controllers: [GithubController],
  providers: [GithubService, EncryptionService],
  exports: [GithubService],
})
export class GithubModule {}
