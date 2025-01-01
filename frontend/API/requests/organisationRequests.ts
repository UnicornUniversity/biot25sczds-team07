import apiClient from "../axiosInstance"
import { Policy } from "./userRequests";
import { Order, PageInfo } from "../types";

const organisationUrlPrefix = "/organisation"

export type OrganisationUser = {
    policy: Policy, id: string // ObjectId
}

export type Organisation = {
    _id: string
    name: string,
    description: string,
    users: OrganisationUser[],
    bucketToken: string,
    createdEpoch: number,
    updatedEpoch: number,
}

export type AddOrganisation = {
    name: string,
    description?: string,
}
const addOrganisation = async (addOrganisation: AddOrganisation) => {
    const response = await apiClient.post(`${organisationUrlPrefix}/add`, addOrganisation);
    return response.data as Organisation;
}

const deleteOrganisation = async (id: string) => {
    const response = await apiClient.post(`${organisationUrlPrefix}/delete`, { id });
    return response.status === 202
}

export type UpdateOrganisation = {
    id: string,
    name?: string,
    description?: string,
    users?: OrganisationUser[],
}
const updateOrganisation = async (updateOrganisation: UpdateOrganisation) => {
    const response = await apiClient.post(`${organisationUrlPrefix}/update`, updateOrganisation);
    return response.data as Organisation
}

const getOrganisation = async (id: string) => {
    const response = await apiClient.get(`${organisationUrlPrefix}/${id}`);
    return response.data as Organisation
}


export type ListOrganisation = {
    pageInfo: PageInfo,
    order: Order,
}
const listOrganisation = async (listOrganisation: ListOrganisation) => {
    const response = await apiClient.post(`${organisationUrlPrefix}/list`, listOrganisation);
    return response.data as { organisations: Organisation[], pageInfo: PageInfo & { total: number } }
}



const organisationRequests = {
    addOrganisation,
    deleteOrganisation,
    updateOrganisation,
    getOrganisation,
    listOrganisation,
}

export default organisationRequests;