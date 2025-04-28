export interface BaseEntity {
    _id: string,
    created: number,
    updated?: number,
    deleted?: number,
}



export interface PageInfo {
    pageIndex: number,
    pageSize: number
}
export type Order = "desc" | "asc"
export interface PaginatedRequest {
    pageInfo?: PageInfo,
    order?: Order,
}
export interface PaginatedResponse {
    pageInfo: {
        pageIndex: number,
        pageSize: number,
        total: number,
    }
}