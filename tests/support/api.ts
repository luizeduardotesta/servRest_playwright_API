import { APIRequestContext } from '@playwright/test'
import { UserModel } from '../models/commonModels'

require('dotenv').config()

const BASE_URL = process.env.BASE_URL

export async function createUser(request: APIRequestContext, user: UserModel) {
    const response = await request.post(`${BASE_URL}/usuarios`, {
        data: user,
    })
    return response;
}

export async function deleteUser(request: APIRequestContext, userId: string) {
    const response = await request.delete(`${BASE_URL}/usuarios/${userId}`)
    return response;
}

export async function listUserByID(request: APIRequestContext, userId: string){
    const response = await request.get(`${BASE_URL}/usuarios/${userId}`)
    return response;
}