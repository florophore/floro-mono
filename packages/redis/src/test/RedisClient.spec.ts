import './test_utils/setGlobals';
import container from './test_utils/testContainer';

import RedisClient from '../RedisClient';
import { describe, test } from 'mocha';
import { expect } from 'chai';

describe('RedisClient', () => {

    let redisClient: RedisClient;

    beforeEach(() => {
        redisClient = container.get(RedisClient);
    })

    test('connects', async () => {
        await redisClient.redis?.set('key', 'value');
        const value = await redisClient.redis?.get('key');
        expect(value).to.equal('value');
    });
});