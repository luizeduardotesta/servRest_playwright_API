import { test, expect } from '@playwright/test';
import { createUser, deleteUser, login } from './support/api';
import { readFileSync } from 'fs';
import { LoginModel, UserModel } from './models/commonModels';

export let userId: string;
export let token: string;

test.describe('Login', () => {
    test('Realizar login com sussesso', async ({ request }) => {
        const userData = JSON.parse(readFileSync('tests/models/user.json', 'utf-8'));
        const user: UserModel = userData.success;
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.success;

        const createResponse = await createUser(request, user);
        expect(createResponse.status()).toEqual(201);
        const createResponseBody = await createResponse.json();
        userId = createResponseBody._id;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(200);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.message).toEqual('Login realizado com sucesso');
        expect(loginResponseBody.authorization).toBeTruthy;
        token = loginResponseBody.authorization;

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    })

    test('Realizar login sem email', async ({ request }) => {
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.emailRequired;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.email).toEqual('email não pode ficar em branco');
    })

    test('Realizar login sem senha', async ({ request }) => {
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.passwordRequired;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.password).toEqual('password não pode ficar em branco');
    })

    test('Realizar login com o email errado', async ({ request }) => {
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.wrongEmail;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(400);

        const loginResponseBody = await loginResponse.json();
        console.log(await loginResponseBody)

        expect(loginResponseBody.email).toEqual('email deve ser um email válido');
    })

    test('Realizar login com a senha errada', async ({ request }) => {
        const loginData = JSON.parse(readFileSync('tests/models/login.json', 'utf-8'));
        const userLogin: LoginModel = loginData.wrongPassword;

        const loginResponse = await login(request, userLogin);
        expect(loginResponse.status()).toEqual(401);

        const loginResponseBody = await loginResponse.json();

        expect(loginResponseBody.message).toEqual('Email e/ou senha inválidos');
    })
})
