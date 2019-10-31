export class AuthUser {
    constructor(tokenUserData: any) {
        if (tokenUserData) {
            this.name = tokenUserData.name;
            this.firstName = tokenUserData.given_name;
            this.lastName = tokenUserData.family_name;
            if (tokenUserData.emails && tokenUserData.emails.length > 0) {
                this.email = tokenUserData.emails[0];
            }
        }
    }

    public name: string;
    public firstName: string;
    public lastName: string;
    public email: string;

    public showName(): string {
        if (name) {
            return this.name;
        }

        if (this.firstName && this.lastName) {
            return `${this.firstName} ${this.lastName}`;
        }

        return '';
    }
}
