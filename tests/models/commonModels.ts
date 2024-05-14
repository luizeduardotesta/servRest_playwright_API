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

export interface LoginModel {
    email: string,
    password: string
    headers: HeadersModel;
}

export interface ProductModel {
    nome: string,
    preco: number,
    descricao: string,
    quantidade: number
    headers: HeadersModel;
}

export interface CartModel {
    produtos: CartProduct[];
}

export interface CartProduct {
    idProduto: string;
    quantidade: number;
}
