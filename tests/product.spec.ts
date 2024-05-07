import { test, expect } from '@playwright/test';
import { createProduct, createUser, deleteProduct, deleteUser, getProduct, login, updateProduct } from './support/api';
import { readFileSync } from 'fs';
import { createUserAndLogin, token, userId, verifyProductCreation } from './support/testUtils';

export let productId: string;

const userDataPath = 'tests/models/user.json';
const loginDataPath = 'tests/models/login.json';
const productDataPath = 'tests/models/product.json';

test.describe('Criar produto', () =>{
    test('Cadastrar produto com sucesso', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).successProduct;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).successProduct;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).success;

        await createUserAndLogin(request, createUser, login, userData, loginData);

        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        
        const createProductResponseBody = await createProductResponse.json();

        expect(createProductResponseBody.message).toEqual('Cadastro realizado com sucesso');
        expect(createProductResponseBody._id).toBeTruthy
        productId = createProductResponseBody._id;

        const getProductResponse = await getProduct(request, productId);
        expect(getProductResponse.status()).toEqual(200);

        const getProductResponseBody = await getProductResponse.json();
        const expectedProductData = { ...productData, _id: productId };
        expect(getProductResponseBody).toEqual(expectedProductData)

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteProductResponseBody = await deleteProductResponse.json();

        expect(deleteProductResponseBody.message).toEqual('Registro excluído com sucesso');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto com nome duplicado', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).duplicateProduct;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).duplicateProduct;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).duplicate;

        await createUserAndLogin(request, createUser, login, userData, loginData);
        
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;

        const duplicateProductResponse = await createProduct(request, productData, token);
        expect(duplicateProductResponse.status()).toEqual(400);
        
        const duplicateProductResponseBody = await duplicateProductResponse.json();

        expect(duplicateProductResponseBody.message).toEqual('Já existe produto com esse nome');

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });
});

test.describe('Atualizar produto', () => {
    test('Atualizar produto com sucesso', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).successUpdatedProduct;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).successUpdatedProduct;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).preUpdate;
        const updatedproductData = JSON.parse(readFileSync(productDataPath, 'utf-8')).update;

        await createUserAndLogin(request, createUser, login, userData, loginData);

        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;

        const getProductResponse = await getProduct(request, productId);
        expect(getProductResponse.status()).toEqual(200);
        const getProductResponseBody = await getProductResponse.json();
        const expectedProductData = { ...productData, _id: productId };
        expect(getProductResponseBody).toEqual(expectedProductData)

        const updatedProductResponse = await updateProduct(request, updatedproductData, token, productId);
        expect(updatedProductResponse.status()).toEqual(200);

        const updatedProductResponseBody = await updatedProductResponse.json();

        expect(updatedProductResponseBody.message).toEqual('Registro alterado com sucesso');
        expect(updatedProductResponseBody).not.toEqual(getProductResponseBody)

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });
});