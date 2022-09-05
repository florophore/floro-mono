import container from './test_utils/testContainer';
import './test_utils/setupTests';

import RedisClient from '../RedisClient';
import { describe, it } from 'mocha';
import { expect } from 'chai';

describe('RedisClient', () => {

    let redisClient: RedisClient;

    beforeEach(() => {
        redisClient = container.get(RedisClient);
    })

    it('connects', async () => {
        await redisClient.redis?.set('key', 'value');
        const value = await redisClient.redis?.get('key');
        expect(value).to.equal('value');
    });
});