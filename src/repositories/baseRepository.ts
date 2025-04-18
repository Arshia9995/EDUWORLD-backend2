import { Model, Document, UpdateQuery, FilterQuery } from "mongoose";
import { IBaseRepository } from "../interfaces/IRepositories";

export class BaseRepository <T extends Document> implements IBaseRepository<T>{
   constructor(protected _model: Model<T>) {
    this._model=_model
   }


   async findAll(filter: Record<string, unknown>,  sort?: any): Promise<T[]> {
    try {
        if (sort) {             
            return await this._model.find(filter).sort(sort );
        }
        return await this._model.find(filter)
    } catch (error) {
        console.error("Error fetching data:", error);
        throw new Error("Could not fetch records");
    }
}



async findById(id: string): Promise<T | null> {
    try {
        return await this._model.findById(id);
    } catch (error) {
        console.error("Error fetching record by ID:", error);
        throw new Error("Could not fetch record by ID");
    }
}

async findByQuery(query:FilterQuery<T>): Promise<T | null> {
    try {
        return await this._model.findOne(query);
    } catch (error) {
        console.error("Error fetching record by ID:", error);
        throw new Error("could not fetch record by ID");
        
    }
}

async create(item: Partial<T>): Promise<T> {
    try {
        return await this._model.create(item);
    } catch (error) {
        console.error("Error creating record:", error);
        throw new Error("Could not create record");
    }
}

async update(id: any, item: UpdateQuery<T>): Promise<T | null> {
    try {
        return await this._model.findByIdAndUpdate(id, item, { new: true });
    } catch (error) {
        console.error("Error updating record:", error);
        throw new Error("Could not update record");
    }
}

async delete(id: string): Promise<boolean> {
    try {
        const result = await this._model.findByIdAndDelete(id);
        return result !== null;
    } catch (error) {
        console.error("Error deleting record:", error);
        throw new Error("Could not delete record");
    }
}

}

