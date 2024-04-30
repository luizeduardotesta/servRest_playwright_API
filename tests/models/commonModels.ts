export interface HeadersModel {
    Accept: string
}

export interface UserModel {
    nome: string,
    email: string,
    password: string,
    administrador: string
    headers: HeadersModel;
}

