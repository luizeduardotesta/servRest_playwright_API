import { expect } from '@playwright/test';
import { UserModel, LoginModel } from '../models/commonModels';

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