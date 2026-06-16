export interface User {
    id: string;
    username: string;
    password?: string;
    fullName: string;
    email: string;
    roles: Role;
    imageUrl?: string;
}

export interface Role {
    id: number | string;
    name: string;
}