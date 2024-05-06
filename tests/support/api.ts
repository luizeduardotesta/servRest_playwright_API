import { APIRequestContext } from '@playwright/test';
import { LoginModel, ProductModel, UserModel } from '../models/commonModels';

require('dotenv').config();

const BASE_URL = process.env.BASE_URL;

export async function createUser(request: APIRequestContext, user: UserModel) {
    const response = await request.post(`${BASE_URL}/usuarios`, {
        data: user
    });
    return response;
};

export async function deleteUser(request: APIRequestContext, userId: string) {
    const response = await request.delete(`${BASE_URL}/usuarios/${userId}`);
    return response;
};

export async function listUserByID(request: APIRequestContext, userId: string) {
    const response = await request.get(`${BASE_URL}/usuarios/${userId}`);
    return response;
};

export async function updateUser(request: APIRequestContext, user: UserModel, userId: string) {
    const response = await request.put(`${BASE_URL}/usuarios/${userId}`, {
        data: user
    });
    return response;
};

export async function login(request: APIRequestContext, userLogin: LoginModel) {
    const response = await request.post(`${BASE_URL}/login`, {
        data: userLogin
    });
    return response
};

export async function createProduct(request: APIRequestContext, product: ProductModel, token: string) {
    const response = await request.post(`${BASE_URL}/produtos`, {
        data: product,
        headers: {
            authorization: `${token}`
        }
    });
    return response
};

export async function deleteProduct(request: APIRequestContext, productId: string, token: string) {
    const response = await request.delete(`${BASE_URL}/produtos/${productId}`, {
        headers: {
            authorization: `${token}`
        }
    });
    return response
};

export async function getProduct(request: APIRequestContext, productId: string) {
    const response = await request.get(`${BASE_URL}/produtos/${productId}`);
    return response;
};