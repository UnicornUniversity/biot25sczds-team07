import apiClient from "../axiosInstance"
import { Order, PageInfo } from "../types";

const userUrlPrefix = "/user"

export enum Policy {
    Admin = 0,
    Member = 1
}

export type User = {
    _id: string,
    firstName: string,
    lastName: string,
    email: string,
    // password: string,
    role: Policy,
    createdEpoch: number,
    updatedEpoch: number,
}

export type RegisterUser = {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Policy,
}
const registerUser = async (addUser: RegisterUser) => {
    const response = await apiClient.post(`${userUrlPrefix}/register`, addUser);
    return response.data as User;
}

export type AuthorizeCredentials = {
    email: string,
    password: string,
    token?: string,
}
export type AuthorizedUser = User & { token: string };
const authorize = async (credentials: AuthorizeCredentials) => {
    const response = await apiClient.post(`${userUrlPrefix}/authorize`, credentials);
    return response.data as AuthorizedUser;
}

export type DeleteUser = {
    id: string,
}
const deleteUser = async (identificator: DeleteUser) => {
    const response = await apiClient.post(`${userUrlPrefix}/delete`, identificator);
    return response.data;
}

export type UpdateUser = {
    id: string
    firstName?: string,
    lastName?: string,
    email?: string,
    password?: string,
    role?: Policy,
}
const updateUser = async (updateUser: UpdateUser) => {
    const response = await apiClient.post(`${userUrlPrefix}/update`, updateUser);
    return response.data;
}

const getUser = async (id: string) => {
    const response = await apiClient.get(`${userUrlPrefix}/get/${id}`);
    return response.data;
}

export type ListUsers = {
    findEmailString: string,
    pageInfo: PageInfo,
    order: Order,
}
const listUsersByEmail = async (filter: ListUsers) => {
    const response = await apiClient.post(`${userUrlPrefix}/list`, filter);
    return response.data;
}

const userRequests = {
    Policy,
    registerUser,
    authorize,
    deleteUser,
    updateUser,
    getUser,
    listUsersByEmail
}

export default userRequests;


