import { test, expect } from '@playwright/test';
import { createProduct, createUser, deleteProduct, deleteUser, getProduct, login } from './support/api';
import { readFileSync } from 'fs';
import { LoginModel, ProductModel, UserModel } from './models/commonModels';

export let userId: string;
export let token: string;
export let productId: string;

test.describe('Criar produto', () =>{
    test.only('Cadastrar produto com sucesso', async ({request}) => {
        const userData = JSON.parse(readFileSync('tests/models/user.json', 'utf-8'));
        const user: UserModel = userData.successProduct;
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.successProduct;
        const productData = JSON.parse(readFileSync('tests/models/product.json', 'utf-8'));
        const product: ProductModel = productData.success;

        const createUserResponse = await createUser(request, user);
        expect(createUserResponse.status()).toEqual(201);
        const createUserResponseBody = await createUserResponse.json();
        userId = createUserResponseBody._id;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(200);
        const loginResponseBody = await loginResponse.json();
        token = loginResponseBody.authorization;

        const createProductResponse = await createProduct(request, product, token);
        expect(createProductResponse.status()).toEqual(201);
        
        const createProductResponseBody = await createProductResponse.json();

        expect(createProductResponseBody.message).toEqual('Cadastro realizado com sucesso');
        expect(createProductResponseBody._id).toBeTruthy
        productId = createProductResponseBody._id;

        const getProductResponse = await getProduct(request, productId);
        expect(getProductResponse.status()).toEqual(200);

        const getProductResponseBody = await getProductResponse.json();
        const expectedProductData = { ...productData.success, _id: productId };
        expect(getProductResponseBody).toEqual(expectedProductData)

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteProductResponseBody = await deleteProductResponse.json();

        expect(deleteProductResponseBody.message).toEqual('Registro excluído com sucesso');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });
});