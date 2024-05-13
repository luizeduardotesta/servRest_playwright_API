import { test, expect } from '@playwright/test';
import { createProduct, createUser, deleteProduct, deleteUser, getProduct, login, updateProduct } from './support/api';
import { readFileSync } from 'fs';
import { createUserAndLogin, token, userId } from './support/testUtils';

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

    test('cadastrar um produto com token invalido', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNoToken;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNoToken;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).productNoToken;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
        
        const token = '';
        
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(401);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.message).toEqual(
            'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
        );

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto com usuario sem acesso de admin', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNotAdmin;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNotAdmin;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).productNotAdmin;

        await createUserAndLogin(request, createUser, login, userData, loginData);
        
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(403);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.message).toEqual('Rota exclusiva para administradores');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto sem nome', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNoName;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNoName;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).nomeRequired;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.nome).toEqual('nome não pode ficar em branco');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto sem preco', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNoPrice;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNoPrice;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).precoRequired;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.preco).toEqual('preco deve ser um número');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto com preco negativo', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNegativePrice;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNegativePrice;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).precoNegative;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.preco).toEqual('preco deve ser um número positivo');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto sem descricao', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNoDescription;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNoDescription;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).descricaoRequired;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.descricao).toEqual('descricao não pode ficar em branco');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto sem quantidade', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNoQuant;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNoQuant;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).quantidadeRequired;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.quantidade).toEqual('quantidade deve ser um número');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('cadastrar um produto com quantidade negativa', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).userNegativeQuant;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginNegativeQuant;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).quantidadeNegative;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(400);
        
        const createProductResponseBody = await createProductResponse.json();
        expect(createProductResponseBody.quantidade).toEqual('quantidade deve ser maior ou igual a 0');

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

    test('Atualizar produto com nome já existente', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).existProduct;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginExistProduct;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).createExistProduct;
        const updatedproductData = JSON.parse(readFileSync(productDataPath, 'utf-8')).editExistProduct;

        let productId2: string;

        await createUserAndLogin(request, createUser, login, userData, loginData);

        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;

        const createExistProductResponse = await createProduct(request, updatedproductData, token);
        expect(createExistProductResponse.status()).toEqual(201);
        const createExistProductResponseBody = await createExistProductResponse.json();
        productId2 = createExistProductResponseBody._id;

        const updatedProductResponse = await updateProduct(request, updatedproductData, token, productId);
        expect(updatedProductResponse.status()).toEqual(400);
        const updatedProductResponseBody = await updatedProductResponse.json();
        expect(updatedProductResponseBody.message).toEqual('Já existe produto com esse nome');

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteExistProductResponse = await deleteProduct(request, productId2, token)
        expect(deleteExistProductResponse.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('Atualizar produto com token invalido', async ({request}) =>{
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).listUserNoToken;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).listLoginNoToken;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).listProductNoToken;

        
        await createUserAndLogin(request, createUser, login, userData, loginData);
                
        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;
        
        const invalidToken = '';

        const updatedProductResponse = await updateProduct(request, productData, invalidToken, productId);
        expect(updatedProductResponse.status()).toEqual(401);
        const updatedProductResponseBody = await updatedProductResponse.json();
        expect(updatedProductResponseBody.message).toEqual(
            'Token de acesso ausente, inválido, expirado ou usuário do token não existe mais'
        );

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);  
    })

    test('Atualizar produto sem acesso de admin', async ({request}) =>{
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).listUserNoAdmin;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).listLoginNoAdmin;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).listtProductNoAdmin;
        
        await createUserAndLogin(request, createUser, login, userData, loginData);

        const updatedProductResponse = await updateProduct(request, productData, token, productId);
        expect(updatedProductResponse.status()).toEqual(403);
        const updatedProductResponseBody = await updatedProductResponse.json();
        expect(updatedProductResponseBody.message).toEqual('Rota exclusiva para administradores');

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);  
    })
});