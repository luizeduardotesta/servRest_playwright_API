import { test, expect } from '@playwright/test';
import { createUser, deleteUser, listUserByID, updateUser } from './support/api';
import { readFileSync } from 'fs';
import { UserModel } from './models/commonModels';

export let userId: string;

const userDataPath = 'tests/models/user.json';

test.describe('Criar', () => {
    test('Criar um usuário com sussesso', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).success;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(201);

        const postResponseBody = await postResponse.json();

        expect(postResponseBody.message).toEqual('Cadastro realizado com sucesso');
        expect(postResponseBody._id).toBeTruthy;
        userId = postResponseBody._id;

        const getResponse = await listUserByID(request, userId);
        expect(getResponse.status()).toEqual(200);
        const getResponseBody = await getResponse.json();
        const expectedUserData = { ...userData, _id: userId };
        expect(getResponseBody).toEqual(expectedUserData)

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
        const deleteResponseBody = await deleteResponse.json();
        expect(deleteResponseBody.message).toEqual('Registro excluído com sucesso');

        const notFoundResponse = await deleteUser(request, userId);
        expect(notFoundResponse.status()).toEqual(200);
        const notFoundResponseBody = await notFoundResponse.json();
        expect(notFoundResponseBody.message).toEqual('Nenhum registro excluído');
    });

    test('Criar um usuário com email repetido', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).duplicate;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(201);
        const postResponseBody = await postResponse.json();
        userId = postResponseBody._id;

        const duplicateResponse = await createUser(request, userData);
        expect(duplicateResponse.status()).toEqual(400);

        const duplicateResponseBody = await duplicateResponse.json();

        expect(duplicateResponseBody.message).toEqual('Este email já está sendo usado')

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('Criar um usuário com o nome em branco', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).nomeRequired;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(400);

        const postResponseBody = await postResponse.json();

        expect(postResponseBody.nome).toEqual('nome não pode ficar em branco');
    })

    test('Criar um usuário com o email em branco', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).emailRequired;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(400);

        const postResponseBody = await postResponse.json();

        expect(postResponseBody.email).toEqual('email não pode ficar em branco');
    })

    test('Criar um usuário com a senha em branco', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).passwordRequired;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(400);

        const postResponseBody = await postResponse.json();

        expect(postResponseBody.password).toEqual('password não pode ficar em branco');
    })
});

test.describe('Atualizar', () => {
    test('Editar um usuário com sussesso', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).preUpdate;
        const userUpdatedData = JSON.parse(readFileSync(userDataPath, 'utf-8')).update;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(201);
        const postResponseBody = await postResponse.json();
        userId = postResponseBody._id;

        const getResponse = await listUserByID(request, userId);
        expect(getResponse.status()).toEqual(200);
        const getResponseBody = await getResponse.json();
        const expectedUserData = { ...userData, _id: userId };
        expect(getResponseBody).toEqual(expectedUserData)

        const putResponse = await updateUser(request, userUpdatedData, userId);
        expect(putResponse.status()).toEqual(200);

        const putResponseBody = await putResponse.json();
        expect(putResponseBody.message).toEqual('Registro alterado com sucesso')

        const updatedGetResponse = await listUserByID(request, userId);
        expect(updatedGetResponse.status()).toEqual(200);
        const updatedGetResponseBody = await updatedGetResponse.json();
        expect(updatedGetResponseBody).not.toEqual(getResponseBody);

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);
    });

    test('Editar um usuário com email já utilizado', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).existUser;
        const existentUserData = JSON.parse(readFileSync(userDataPath, 'utf-8')).editExistUser;

        let existentUserId: string;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(201);
        const postResponseBody = await postResponse.json();
        userId = postResponseBody._id;

        const existentPostResponse = await createUser(request, existentUserData);
        expect(existentPostResponse.status()).toEqual(201);
        const existentPostResponseBody = await existentPostResponse.json();
        existentUserId = existentPostResponseBody._id;

        const putResponse = await updateUser(request, existentUserData, userId);
        expect(putResponse.status()).toEqual(400);
        const putResponseBody = await putResponse.json();
        expect(putResponseBody.message).toEqual('Este email já está sendo usado')

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);

        const deleteResponse2 = await deleteUser(request, existentUserId);
        expect(deleteResponse2.status()).toEqual(200);
    });
});

test.describe('Listar', () => {
    test('listar um usuário que não existe', async ({ request }) => {
        const userData = JSON.parse(readFileSync(userDataPath, 'utf-8')).listNotFound;

        const postResponse = await createUser(request, userData);
        expect(postResponse.status()).toEqual(201);
        const postResponseBody = await postResponse.json();
        userId = postResponseBody._id;

        const deleteResponse = await deleteUser(request, userId);
        expect(deleteResponse.status()).toEqual(200);

        const getResponse = await listUserByID(request, userId);
        expect(getResponse.status()).toEqual(400);
        const getResponseBody = await getResponse.json();
        expect(getResponseBody.message).toEqual('Usuário não encontrado');
    });
});