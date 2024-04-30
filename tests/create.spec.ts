import { test, expect } from '@playwright/test';
import { postUser } from './support/helper';
import * as fs from 'fs';

let userId: string

test.describe('Criar', () => {
    test.only('Criar um usuário com sussesso', async ({ request }) => {
        const rawData = fs.readFileSync('tests/models/create.json');
        const userData = JSON.parse(rawData.toString());

        const user = userData.success;
        const headers = userData.headers;

        const response = await postUser(request, user, headers);

        const postResponseBody = await response.json()
        expect(postResponseBody.message).toEqual('Cadastro realizado com sucesso')
        expect(postResponseBody._id).toBeTruthy
        userId = postResponseBody._id
    })
})