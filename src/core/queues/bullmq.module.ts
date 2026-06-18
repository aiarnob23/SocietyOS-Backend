// src/core/queues/bullmq.module.ts
import { Module, Global } from '@nestjs/common';
import { Queue } from 'bullmq';
import { config } from '../config';
import { QUEUES } from './queue.constants';

@Global()
@Module({
    providers: [
        {
            provide: QUEUES.SESSION,
            useFactory: () => {
                return new Queue(QUEUES.SESSION, {
                    connection: {
                        host: config.redis.host,
                        port: config.redis.port,
                    },
                });
            },
            inject: [],
        },
    ],
    exports: [QUEUES.SESSION],
})
export class BullMQModule { }