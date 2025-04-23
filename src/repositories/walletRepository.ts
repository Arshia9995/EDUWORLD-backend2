import { IWallet } from "../interfaces/IWallet";
import { walletModel } from "../models/walletModel";
import { BaseRepository } from "./baseRepository";
import mongoose, { FilterQuery, UpdateQuery } from 'mongoose';


class WalletRepository extends BaseRepository<IWallet> {
    constructor() {
        super(walletModel);
    }

    async findOne(query: FilterQuery<IWallet>): Promise<IWallet | null> {
        return await this._model.findOne(query).exec();
      }
    
      async create(data: Partial<IWallet>): Promise<IWallet> {
        return await this._model.create(data);
      }
    
      async updateOne(query: FilterQuery<IWallet>, update: UpdateQuery<IWallet>): Promise<void> {
        await this._model.updateOne(query, update).exec();
      }

   
    
}



export default WalletRepository;