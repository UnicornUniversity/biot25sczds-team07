import apiClient from "../axiosInstance"
import { BaseEntity, PaginatedRequest, PaginatedResponse } from "../types/basic";
import { Policy } from "./userRequests";

const URL_PREFIX = "/organisation"

export interface OrganisationUser {
    id: string
    policy: Policy,

}

export interface Organisation extends BaseEntity {
    name: string,
    description: string,
    users: OrganisationUser[],
    bucketToken: string,
}

export interface AddOrganisationDtoIn {
    name: string,
    description?: string,
}
const addOrganisation = async (addOrganisation: AddOrganisationDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/add`, addOrganisation);
    return response.data as Organisation;
}

const deleteOrganisation = async (id: string) => {
    const response = await apiClient.post(`${URL_PREFIX}/delete`, { id });
    return response.status === 202
}

export interface UpdateOrganisationDtoIn {
    id: string,
    name?: string,
    description?: string,
    users?: OrganisationUser[],
}
const updateOrganisation = async (updateOrganisation: UpdateOrganisationDtoIn) => {
    const response = await apiClient.post(`${URL_PREFIX}/update`, updateOrganisation);
    return response.data as Organisation
}

const getOrganisation = async (id: string) => {
    const response = await apiClient.get(`${URL_PREFIX}/${id}`);
    return response.data as Organisation
}

export interface ListOrganisationDtoOut extends PaginatedResponse {
    organisations: Organisation[],
}
const listOrganisation = async (listOrganisation: PaginatedRequest) => {
    const response = await apiClient.post(`${URL_PREFIX}/list`, listOrganisation);
    return response.data as ListOrganisationDtoOut;
}



const organisationRequests = {
    addOrganisation,
    deleteOrganisation,
    updateOrganisation,
    getOrganisation,
    listOrganisation,
}

export default organisationRequests;