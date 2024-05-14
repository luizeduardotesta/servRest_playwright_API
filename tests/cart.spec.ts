import { test, expect } from '@playwright/test';
import { createProduct, createUser, deleteProduct, deleteUser, login, createCart, concludeCart, cancelCart, getCart, getProduct } from './support/api';
import { readFileSync } from 'fs';
import { createUserAndLogin, token, userId } from './support/testUtils';
import { CartModel, CartProduct } from './models/commonModels';

export let productId: string;
export let cartId: string;

const userDataPath = 'tests/models/user.json';
const loginDataPath = 'tests/models/login.json';
const productDataPath = 'tests/models/product.json';

test.describe('Criar carrinho', () => {
    test('Criar carrinho com sucesso e efetuar uma compra', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).successCart;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginCart;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).successCart;

        await createUserAndLogin(request, createUser, login, userData, loginData);

        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;

        const getProductResponse = await getProduct(request, productId);
        expect(getProductResponse.status()).toEqual(200);
        const getProductResponseBody = await getProductResponse.json();

        const cartProduct: CartProduct = { idProduto: productId, quantidade: 1 };
        const cart: CartModel = { produtos: [cartProduct] };

        const createCartResponse = await createCart(request, cart, token);
        expect(createCartResponse.status()).toEqual(201);

        const createCartResponseBody = await createCartResponse.json();

        expect(createCartResponseBody.message).toEqual('Cadastro realizado com sucesso');
        expect(createCartResponseBody._id).toBeTruthy
        cartId = createCartResponseBody._id;

        const getCartResponse = await getCart(request, cartId)
        expect(getCartResponse.status()).toEqual(200);

        const getCartResponseBody = await getCartResponse.json();
        
        expect(getCartResponseBody.produtos[0].idProduto).toEqual(productId);
        expect(getCartResponseBody.produtos[0].quantidade).toEqual(1);
        expect(getCartResponseBody.produtos[0].precoUnitario).toEqual(getProductResponseBody.preco);
        expect(getCartResponseBody.quantidadeTotal).toEqual(1);
        expect(getCartResponseBody.precoTotal).toEqual(getProductResponseBody.preco);
        expect(getCartResponseBody.idUsuario).toEqual(userId);
        expect(getCartResponseBody._id).toEqual(cartId);

        const concludeCartResponse = await concludeCart(request, token)
        expect(concludeCartResponse.status()).toEqual(200);

        const concludeCartResponseBody = await concludeCartResponse.json();

        expect(concludeCartResponseBody.message).toEqual('Registro excluído com sucesso');

        const getUpdatedProductResponse = await getProduct(request, productId);
        expect(getUpdatedProductResponse.status()).toEqual(200);
        const getUpdatedProductResponseBody = await getUpdatedProductResponse.json();
        expect(getUpdatedProductResponseBody._id).toEqual(productId);
        expect(getUpdatedProductResponseBody.quantidade).toEqual(getProductResponseBody.quantidade -1);


        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test.only('Criar carrinho com 2 produtos com sucesso e efetuar cancelar uma compra', async ({request}) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).successCart2;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).loginCart2;
        const productData = JSON.parse(readFileSync(productDataPath, 'utf-8')).successCart2;
        const productData2 = JSON.parse(readFileSync(productDataPath, 'utf-8')).secondSuccessCart

        let productId2: string;

        await createUserAndLogin(request, createUser, login, userData, loginData);

        const createProductResponse = await createProduct(request, productData, token);
        expect(createProductResponse.status()).toEqual(201);
        const createProductResponseBody = await createProductResponse.json();
        productId = createProductResponseBody._id;

        const createProduct2Response = await createProduct(request, productData2, token);
        expect(createProduct2Response.status()).toEqual(201);
        const createProduct2ResponseBody = await createProduct2Response.json();
        productId2 = createProduct2ResponseBody._id;

        const getProductResponse = await getProduct(request, productId);
        expect(getProductResponse.status()).toEqual(200);
        const getProductResponseBody = await getProductResponse.json();

        const getProductResponse2 = await getProduct(request, productId2);
        expect(getProductResponse2.status()).toEqual(200);
        const getProductResponseBody2 = await getProductResponse2.json();

        const cartProduct: CartProduct = { idProduto: productId, quantidade: 1 };
        const cartProduct2: CartProduct = { idProduto: productId2, quantidade: 3 };
        const cart: CartModel = { produtos: [cartProduct, cartProduct2] };

        const createCartResponse = await createCart(request, cart, token);
        expect(createCartResponse.status()).toEqual(201);
        const createCartResponseBody = await createCartResponse.json();
        cartId = createCartResponseBody._id;

        const getCartResponse = await getCart(request, cartId)
        expect(getCartResponse.status()).toEqual(200);
        const getCartResponseBody = await getCartResponse.json();
        expect(getCartResponseBody.produtos[0].idProduto).toEqual(productId);
        expect(getCartResponseBody.produtos[0].quantidade).toEqual(1);
        expect(getCartResponseBody.produtos[0].precoUnitario).toEqual(getProductResponseBody.preco);
        
        expect(getCartResponseBody.produtos[1].idProduto).toEqual(productId2);
        expect(getCartResponseBody.produtos[1].quantidade).toEqual(3);
        expect(getCartResponseBody.produtos[1].precoUnitario).toEqual(getProductResponseBody2.preco);

        expect(getCartResponseBody.quantidadeTotal).toEqual(4);
        expect(getCartResponseBody.precoTotal).toEqual(
            (getProductResponseBody.preco * getCartResponseBody.produtos[0].quantidade) +
            (getProductResponseBody2.preco * getCartResponseBody.produtos[1].quantidade)
        );
        expect(getCartResponseBody.idUsuario).toEqual(userId);
        expect(getCartResponseBody._id).toEqual(cartId);

        const cancelCartResponse = await cancelCart(request, token)
        expect(cancelCartResponse.status()).toEqual(200);

        const cancelCartResponseBody = await cancelCartResponse.json();

        expect(cancelCartResponseBody.message).toEqual('Registro excluído com sucesso. Estoque dos produtos reabastecido');

        const getUpdatedProductResponse = await getProduct(request, productId);
        expect(getUpdatedProductResponse.status()).toEqual(200);
        const getUpdatedProductResponseBody = await getUpdatedProductResponse.json();
        expect(getUpdatedProductResponseBody._id).toEqual(productId);
        expect(getUpdatedProductResponseBody.quantidade).toEqual(getProductResponseBody.quantidade);

        const getUpdatedProductResponse2 = await getProduct(request, productId);
        expect(getUpdatedProductResponse2.status()).toEqual(200);
        const getUpdatedProductResponseBody2 = await getUpdatedProductResponse2.json();
        expect(getUpdatedProductResponseBody2._id).toEqual(productId);
        expect(getUpdatedProductResponseBody2.quantidade).toEqual(getProductResponseBody2.quantidade);

        const deleteProductResponse = await deleteProduct(request, productId, token)
        expect(deleteProductResponse.status()).toEqual(200);

        const deleteProductResponse2 = await deleteProduct(request, productId2, token)
        expect(deleteProductResponse2.status()).toEqual(200);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });
});
