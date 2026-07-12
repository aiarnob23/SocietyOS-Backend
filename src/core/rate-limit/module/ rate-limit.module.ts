import { Module } from '@nestjs/common';
import { TokenBucketService } from '../services/token-bucket.service';
import { RateLimitGuard } from '../guards/rate-limit.guard';
;

@Module({
  providers: [
    TokenBucketService,
    RateLimitGuard,
  ],
  exports: [
    TokenBucketService,
    RateLimitGuard,
  ],
})
export class RateLimitModule {}