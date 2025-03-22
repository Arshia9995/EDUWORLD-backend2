import { IResponse } from "./IResponse";
import { UserDoc } from "./IUser";
import { CategoryDoc } from "./ICategory";
import { ICourse } from "./ICourse";
import { ILesson } from "./ILesson";

export interface IUserService {
    signUp(user: UserDoc): Promise<IResponse>;
    verifyUser(otp: string, email: string): Promise<IResponse>;
    loginUser(email: string, password: string): Promise<IResponse>; 
    resendOtp(email: string): Promise<IResponse>;
    forgotPassword(email: string): Promise<IResponse>; 
    forgotOtpVerify(email: string, otp: string): Promise<IResponse>;
   resetPassword (
        email: string,
        password: { newPassword: string; confirmPassword: string }
      ): Promise<IResponse>;
      updateProfile(email: string, userData: UserDoc): Promise<IResponse>;
      isExist(id: string):Promise<IResponse>;
      registerInstructor(
        email: string,
        profileData: {
          dob: string;
          gender: string;
          phone: string;
          address: string;
        },
        instructorData: {
          qualification: string;
        }
      ): Promise<IResponse>;
     getS3Url(fileName: string, fileType: string): Promise<{ url: string; imageUrl: string; downloadUrl: string }>;
     getInstructorById(id: any): Promise<any>;
      
}

export interface IAdminService {
    adminLogin(email: string, password: string): Promise<IResponse>;
    getAllStudents(): Promise<IResponse>;
    blockUser(userId: string): Promise<IResponse>;      // New method
    unblockUser(userId: string): Promise<IResponse>;
    blockInstructor(instructorId: string): Promise<IResponse>;      // New method
    unblockInstructor(instructorId: string): Promise<IResponse>;
    getAllInstructors(): Promise<IResponse>;
    approveInstructor(instructorId: string): Promise<IResponse>;
    rejectInstructor(instructorId: string): Promise<IResponse>;
}

export interface ICategoryService {
  addCategory(categoryName: string): Promise<IResponse>;
  getAllCategories(): Promise<IResponse>;
  updateCategory(id: string, categoryName: string): Promise<IResponse>;
  blockCategory(id: string): Promise<IResponse>;
  unblockCategory(id: string): Promise<IResponse>;
  fetchAllCategories(): Promise<IResponse>;

}

export interface ICourseService {

  addCourse(courseData: Partial<ICourse>): Promise<IResponse>;

}

export interface ILessonService {
  addLesson(lessonData: Partial<ILesson>, instructorId: string):Promise<IResponse>;

}