import jwt from 'jsonwebtoken';

export class JwtService {
  constructor(private secret: string, private expiresIn: number) {}

  sign(payload: object): string {
    return jwt.sign(payload, this.secret, { expiresIn: this.expiresIn });
  }

  verify(token: string): any {
    return jwt.verify(token, this.secret);
  }
}
