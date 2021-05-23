import { Injectable } from '@nestjs/common';

// special case, must use require :)
const { promisify } = require('util');
import * as redis from 'redis';

@Injectable()
export class RedisService {
  constructor() { }

  RedisOption = {
    host: process.env.REDIS_HOST,
    port: 6379,
    password: process.env.REDIS_PWD,
  };

  redisClient = redis.createClient(this.RedisOption);

  get = promisify(this.redisClient.get).bind(this.redisClient);

  set(key, value, ex, ttl = null) {
    if (ttl) {
      this.redisClient.set(key, value, ex, ttl);
      return;
    }
    this.redisClient.set(key, value, ex);

  }

  hmset(list) {
    this.redisClient.hmset(list, (err, res) => {
      if (res) {
        return;
      }
    })
  }

  hset(list) {
    this.redisClient.hset(list, (err, res) => {
      if (res) {
        return;
      }
    })
  }

  del(key) {
    this.redisClient.del(key, (err, res) => {
      if (res) {
        return;
      }
    });
  }

}
