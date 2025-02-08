import { OtpDoc } from "./IOtp";
import { FilterQuery } from "mongoose";

export interface IBaseRepository<T> {
    
    findAll(filter: Record<string, unknown>, skip: number,sort:Record<string, unknown>, limit: number): Promise<T[]>
    findById(id: string): Promise<T | null>
    create(item: Partial<T>): Promise<T>
    findByQuery(query: FilterQuery<T>): Promise<T | null>
    update(id: string, item: Partial<T>): Promise<T | null>
    delete(id: string): Promise<boolean>
}

export interface IOtpRepository extends IBaseRepository<OtpDoc>{
    getOtpByEmail(email: string): Promise<OtpDoc | null>
}