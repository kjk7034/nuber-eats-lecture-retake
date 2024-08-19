import { Inject, Injectable } from '@nestjs/common';
import * as jwt from 'jsonwebtoken';

import { JwtModuleOptions } from './jwt.interfaces';
import { JWT_CONFIG_OPTIONS } from 'src/common/common.constants';

@Injectable()
export class JwtService {
  constructor(
    @Inject(JWT_CONFIG_OPTIONS) private readonly options: JwtModuleOptions,
  ) {}
  sign(userId: string): string {
    return jwt.sign({ id: userId }, this.options.privateKey);
  }
  verify(token: string) {
    return jwt.verify(token, this.options.privateKey);
  }
}
