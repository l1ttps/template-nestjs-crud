import * as jwt from 'jsonwebtoken';
export default class Jwt {
  static generate(role: string, userId: string, serectKeyJwt: string, ttl) {
    if (typeof ttl === 'string') {
      ttl = parseInt(ttl);
    }
    const payload = {
      r: role,
      i: userId,
      exp:
        ttl > 0
          ? Math.floor(Date.now() / 1000) + ttl
          : Math.floor(Date.now() / 1000) + 7 * 24 * 60 * 60,
    };
    return jwt.sign(payload, serectKeyJwt);
  }
  static decode(token: string) {
    return jwt.decode(token.replace('Bearer ', ''));
  }
  static verify(token: string, serectKeyJwt: string) {
    return jwt.verify(token.replace('Bearer ', ''), serectKeyJwt);
  }
}
