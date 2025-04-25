import { UserDoc } from "../interfaces/IUser";
import User from "../models/userModel";
import { BaseRepository } from "./baseRepository";

class UserRepository extends BaseRepository<UserDoc>{

    constructor() {
        super(User)
    }

    async findById(userId: string): Promise<UserDoc | null> {
        try {
          return await this._model.findById(userId).exec();
        } catch (error) {
          throw new Error(`Failed to find user by ID: ${(error as Error).message}`);
        }
      }
    
      async findByEmail(email: string): Promise<UserDoc | null> {
        try {
          return await this._model.findOne({ email }).exec();
        } catch (error) {
          throw new Error(`Failed to find user by email: ${(error as Error).message}`);
        }
      }

      async getTotalInstructors(): Promise<number> {
        try {
          return await this._model.countDocuments({ role: 'instructor' });
        } catch (error) {
          console.error('Error in UserRepository.getTotalInstructors:', error);
          throw new Error('Could not fetch total instructors');
        }
      }
}

export default UserRepository;