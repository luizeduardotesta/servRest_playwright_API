import { test, expect } from '@playwright/test';
import { createUser, deleteUser } from './support/api';
import { readFileSync } from 'fs';
import { UserModel } from './models/commonModels';

export let userId: string

test.describe('Criar', () => {
    test.only('Criar um usuário com sussesso', async ({ request }) => {
        const userData = JSON.parse(readFileSync('tests/models/create.json', 'utf-8'));
        const user: UserModel = userData.success;

        const postDesponse = await createUser(request, user);
        expect(postDesponse.status()).toEqual(201)

        const postResponseBody = await postDesponse.json()

        expect(postResponseBody.message).toEqual('Cadastro realizado com sucesso')
        expect(postResponseBody._id).toBeTruthy
        userId = postResponseBody._id

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200)

        const deleteResponseBody = await deleteResponse.json()

        expect(deleteResponseBody.message).toEqual('Registro excluído com sucesso')
    })
})