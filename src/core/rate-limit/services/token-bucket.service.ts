import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import Redis from 'ioredis';
import { promises as fs } from 'fs';
import { join } from 'path';

import { REDIS_CLIENT } from '../../redis/redis.constant';

@Injectable()
export class TokenBucketService implements OnModuleInit {
  private sha!: string;

  constructor(
    @Inject(REDIS_CLIENT)
    private readonly redis: Redis,
  ) {}

  async onModuleInit(): Promise<void> {
    this.sha = await this.loadScript();
  }

  private async loadScript(): Promise<string> {
    const script = await fs.readFile(
      join(__dirname, '../scripts/token-bucket.lua'),
      'utf8',
    );

    const sha = await this.redis.script('LOAD', script);

    if (typeof sha !== 'string') {
      throw new Error('Failed to load token bucket lua script.');
    }

    return sha;
  }

  async consume(
    key: string,
    capacity: number,
    refillRate: number,
    requestedTokens = 1,
  ): Promise<{
    allowed: boolean;
    remainingTokens: number;
  }> {
    const now = Math.floor(Date.now() / 1000);

    const result = await this.redis.evalsha(
      this.sha,
      1,
      key,
      capacity,
      refillRate,
      now,
      requestedTokens,
    );

    if (!Array.isArray(result) || result.length < 2) {
      throw new Error('Invalid response returned from redis lua script.');
    }

    return {
      allowed: Number(result[0]) === 1,
      remainingTokens: Number(result[1]),
    };
  }
}