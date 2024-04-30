import { expect, APIRequestContext } from '@playwright/test'
import { UserModel } from '../models/user.model'
import { headersModel } from '../models/headers.model'

require('dotenv').config()

const BASE_URL = process.env.BASE_URL

export async function postUser(request: APIRequestContext, user: UserModel, headers: headersModel) {
    const response = await request.post(`${BASE_URL}/usuarios`, {
        data: user,
        headers: { Accept: headers.Accept }
    })
    console.log(await response.json())

    expect(response.status()).toEqual(201)
    return response;
}