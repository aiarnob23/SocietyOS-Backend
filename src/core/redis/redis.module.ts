// src/redis/redis.module.ts
import { Module, Global } from '@nestjs/common';
import Redis from 'ioredis';
import { config } from '../config';
import { REDIS_CLIENT } from './redis.constant';

@Global()
@Module({
  providers: [
    {
      provide: REDIS_CLIENT,
      useFactory: () => {
        return new Redis({
          host: config.redis.host,
          port: config.redis.port,
        });
      },
    },
  ],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}