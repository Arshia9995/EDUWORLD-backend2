import { IResponse } from "./IResponse";
import { UserDoc } from "./IUser";

export interface IUserService {
    signUp(user: UserDoc): Promise<IResponse>;
    verifyUser(otp: string, email: string): Promise<IResponse>;
    loginUser(email: string, password: string): Promise<IResponse>; 
    resendOtp(email: string): Promise<IResponse>;
    forgotPassword(email: string): Promise<IResponse>; 
}