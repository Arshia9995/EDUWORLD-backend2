import { AdminDoc } from "../interfaces/IAdmin";
import AdminRepository from "../repositories/adminRepository";
import bcrypt from "bcryptjs";
import { IAdminService } from "../interfaces/IServices";
import UserRepository from "../repositories/userRepository";
import dotenv from "dotenv";

dotenv.config();




export class AdminServices implements IAdminService {
    constructor(
        // private _userRepository: UserRepository,
        private _adminRepository: AdminRepository
    ){
        // this._userRepository = _userRepository;
        this._adminRepository = _adminRepository;
    }

    async adminLogin(email: string, password:string) {
        let admin = await this._adminRepository.findByQuery({ email });

        if(!admin) {
            if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                admin =await this._adminRepository.create({
                    email,
                    password: await bcrypt.hash(password, 10),
                } as AdminDoc);
                return { success: true, message: "Admin account created and logged in successfully" };
            } else {
                return { success: false, message: "Invalid credentials" };
            }
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid credentials" };
          }

          return { success: true, message: "Login successful" };

    }





}
