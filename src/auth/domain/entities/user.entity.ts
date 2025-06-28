export class AuthUser {
  constructor(
    public id: string,
    public name: string,
    public email: string,
    public password: string,
    public verified: boolean
  ) {}
}
