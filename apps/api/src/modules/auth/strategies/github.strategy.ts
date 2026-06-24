import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-github2';
import { ConfigService } from '@nestjs/config';
import { AuthService } from '../auth.service';

interface GitHubProfile {
  id: string;
  username: string;
  displayName: string;
  emails: Array<{ value: string }>;
  photos: Array<{ value: string }>;
}

@Injectable()
export class GithubStrategy extends PassportStrategy(Strategy, 'github') {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    super({
      clientID: configService.get<string>('github.clientId') ?? '',
      clientSecret: configService.get<string>('github.clientSecret') ?? '',
      callbackURL: configService.get<string>('github.callbackUrl') ?? '',
      // Read-only: we only list the user's repos to import as portfolio
      // projects (GET /user/repos). We never write, so we don't request the
      // broad read/write `repo` scope. (Note: this means private repos are not
      // visible — a GitHub App with fine-grained read-only perms is needed for that.)
      scope: ['user:email', 'read:user'],
    });
  }

  async validate(accessToken: string, _refreshToken: string, profile: GitHubProfile) {
    return this.authService.findOrCreateGithubUser({
      githubId: profile.id,
      username: profile.username,
      name: profile.displayName ?? profile.username,
      email: profile.emails?.[0]?.value ?? `${profile.username}@github.local`,
      avatar: profile.photos?.[0]?.value,
      accessToken,
    });
  }
}
