import { test, expect } from '@playwright/test';
import { createUser, deleteUser, login } from './support/api';
import { readFileSync } from 'fs';
import { LoginModel, UserModel } from './models/commonModels';

export let userId: string;
export let token: string;

const userDataPath = 'tests/models/user.json';
const loginDataPath = 'tests/models/login.json';

test.describe('Login', () => {
    test('Realizar login com sussesso', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).successLogin;
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).success;

        const createResponse = await createUser(request, userData);
        expect(createResponse.status()).toEqual(201);
        const createResponseBody = await createResponse.json();
        userId = createResponseBody._id;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(200);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.message).toEqual('Login realizado com sucesso');
        expect(loginResponseBody.authorization).toBeTruthy;
        token = loginResponseBody.authorization;

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    })

    test('Realizar login sem email', async ({ request }) => {
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).emailRequired;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.email).toEqual('email não pode ficar em branco');
    })

    test('Realizar login sem senha', async ({ request }) => {
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).passwordRequired;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.password).toEqual('password não pode ficar em branco');
    })

    test('Realizar login com o email com formato invalido', async ({ request }) => {
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).invalidEmail;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.email).toEqual('email deve ser um email válido');
    })

    test('Realizar login com o email errado', async ({ request }) => {
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).wrongEmail;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(401);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.message).toEqual('Email e/ou senha inválidos');
    })

    test('Realizar login com a senha errada', async ({ request }) => {
        const loginData = JSON.parse(readFileSync(loginDataPath, 'utf-8')).wrongPassword;

        const loginResponse = await login(request, loginData);
        expect(loginResponse.status()).toEqual(401);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.message).toEqual('Email e/ou senha inválidos');
    })
})
