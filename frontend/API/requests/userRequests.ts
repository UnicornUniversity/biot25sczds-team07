import apiClient from "../axiosInstance"
import { BaseEntity, PageInfo, PaginatedRequest } from "../types/basic";

const URL_PREFIX = "/user"

export enum Policy {
    Admin = 0,
    Member = 1
}
export interface User extends BaseEntity {
    firstName: string,
    lastName: string,
    email: string,
    role: Policy,
}



export interface RegisterUserDtoIn {
    firstName: string,
    lastName: string,
    email: string,
    password: string,
    role: Policy,
}
const registerUser = async (addUser: RegisterUserDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/register`, addUser);
    return response.data as User;
}



export interface AuthorizeUserDtoIn {
    email: string,
    password: string,
    token?: string,
}
export interface AuthorizedUser extends User { token: string };
const authorize = async (credentials: AuthorizeUserDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/authorize`, credentials);
    return response.data as AuthorizedUser;
}


const deleteUser = async (id: string) => {
    const response = await apiClient.post(`${URL_PREFIX}/delete`, { id });
    return response.status === 202;
}

export interface UpdateUserDtoIn {
    _id: string
    firstName?: string,
    lastName?: string,
    email?: string,
    role?: Policy,
}
const updateUser = async (updateUser: UpdateUserDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/update`, updateUser);
    return response.data as User;
}

const getUser = async (id: string) => {
    const response = await apiClient.get(`${URL_PREFIX}/get/${id}`);
    return response.data as User;
}

export interface ListUsersDtoIn extends PaginatedRequest {
    findEmailString: string,
}
export interface ListUsersDtoOut {
    users: User[],
    pageInfo: PageInfo,
}
const listUsersByEmail = async (filter: ListUsersDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/list`, filter);
    return response.data as ListUsersDtoOut;
}

const userRequests = {
    registerUser,
    authorize,
    deleteUser,
    updateUser,
    getUser,
    listUsersByEmail
}

export default userRequests;


