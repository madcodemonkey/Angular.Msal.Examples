export class AuthUser {
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
