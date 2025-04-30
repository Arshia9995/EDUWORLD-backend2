import { IAdminWallet } from "../interfaces/IAdminwallet";
import { adminWalletModel } from "../models/adminWalletModel";
import { BaseRepository } from "./baseRepository";
import { ObjectId } from 'mongodb';

class AdminWalletRepository extends BaseRepository<IAdminWallet> {
    constructor() {
        super(adminWalletModel)
    }

    async findOne(query: any): Promise<IAdminWallet | null> {
        try {
          return await this._model.findOne(query);
        } catch (error) {
          console.error('Error in AdminWalletRepository.findOne:', error);
          throw error;
        }
      }

      async create(walletData: any): Promise<IAdminWallet> {
        try {
          return await this._model.create(walletData);
        } catch (error) {
          console.error('Error in AdminWalletRepository.create:', error);
          throw error;
        }
      }

      async update(adminId: string, updateData: any): Promise<IAdminWallet | null> {
        try {
          return await this._model.findOneAndUpdate(
            { adminId: new ObjectId(adminId) },
            { $set: updateData },
            { new: true }
          );
        } catch (error) {
          console.error('Error in AdminWalletRepository.update:', error);
          throw error;
        }
      }
}

export default AdminWalletRepository;