import { AdminDoc } from "../interfaces/IAdmin";
import Admin from "../models/adminModel";
import { BaseRepository } from "./baseRepository";

class AdminRepository extends BaseRepository<AdminDoc>{
    constructor() {
        super(Admin)
    }

    async findOne(query: any): Promise<AdminDoc | null> {
        return await Admin.findOne(query).exec();
      }
}

export default AdminRepository;