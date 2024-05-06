import { expect } from '@playwright/test';
import { UserModel, LoginModel, ProductModel } from '../models/commonModels';

export let userId: string;
export let token: string;
export let productId: string;

export async function createUserAndLogin(request: any, createUser: any, login: any, userData: UserModel, loginData: LoginModel) {
    const createUserResponse = await createUser(request, userData);
    expect(createUserResponse.status()).toEqual(201);
    const createUserResponseBody = await createUserResponse.json();
    userId = createUserResponseBody._id;

    const loginResponse = await login(request, loginData);
    expect(loginResponse.status()).toEqual(200);
    const loginResponseBody = await loginResponse.json();
    token = loginResponseBody.authorization;
}

export async function verifyProductCreation(request: any, createProduct: any, getProduct: any, product: ProductModel, token: string) {
    const createProductResponse = await createProduct(request, product, token);
    expect(createProductResponse.status()).toEqual(201);
    
    const createProductResponseBody = await createProductResponse.json();
    expect(createProductResponseBody.message).toEqual('Cadastro realizado com sucesso');
    expect(createProductResponseBody._id).toBeTruthy();
    productId = createProductResponseBody._id;

    const getProductResponse = await getProduct(request, productId);
    expect(getProductResponse.status()).toEqual(200);

    const getProductResponseBody = await getProductResponse.json();
    const expectedProductData = { ...product, _id: productId };
    expect(getProductResponseBody).toEqual(expectedProductData);
}