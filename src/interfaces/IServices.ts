import { IResponse } from "./IResponse";
import { UserDoc } from "./IUser";
import { CategoryDoc } from "./ICategory";
import { ICourse } from "./ICourse";
import { ILesson } from "./ILesson";
import { IEnrollment } from "./IEnrollment";
import { IWallet } from "./IWallet";

export interface IUserService {
    signUp(user: UserDoc): Promise<IResponse>;
    verifyUser(otp: string, email: string): Promise<IResponse>;
    loginUser(email: string, password: string): Promise<IResponse>; 
    // googleLogin(token: string): Promise<IResponse>; 
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
     getDownloadUrl(key: string):Promise<string>;
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
  publishCourse(courseId: string, instructorId: string): Promise<IResponse>;
  getPublishedCoursesByInstructor(instructorId: string):Promise<IResponse>;
  getPublishedCoursesByInstructor(
    instructorId: string, 
    page?: number, 
    limit?: number, 
    search?: string, 
    sortBy?: string, 
    category?: string, 
    priceRange?: string, 
    language?: string
  ): Promise<IResponse>;  
  getCourseById(courseId: string, instructorId: string):Promise<IResponse>;
  getAllPublishedCourses(
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    category?: string,
    priceRange?: string,
    language?: string
  ): Promise<IResponse>;
  getStudentCourseById(courseId: string): Promise<IResponse>;
  updateCourse(courseId: string, userId: string, updateData: ICourse): Promise<IResponse>;

}

export interface ILessonService {
  addLesson(lessonData: Partial<ILesson>, instructorId: string):Promise<IResponse>;
  getLessonsByCourseId(courseId: string, instructorId: string) :Promise<IResponse>;
  getUpdateLessonsByCourseId(courseId: string, instructorId: string) :Promise<IResponse>;
  getStudentLessonsByCourseId(courseId: string, userRole: string):Promise<IResponse>;
  updateLesson(lessonId: string, lessonData: Partial<ILesson>, instructorId: string):Promise<IResponse>;
  deleteLesson(lessonId: string, instructorId: string): Promise<IResponse>;


  
}

export interface IEnrollmentService {
  enrollUser(userId: string, courseId: string): Promise<IEnrollment>;
  checkEnrollment(userId: string, courseId: string): Promise<boolean>;
  getEnrolledCourses(
    userId: string,
    page?: number,
    limit?: number,
    search?: string,
    sortBy?: string,
    category?: string,
    priceRange?: string,
    language?: string
  ): Promise<{
    courses: any[];
    totalCourses: number;
    currentPage: number;
    totalPages: number;
  }>;
  getEnrolledCourse(courseId: string, studentId: string): Promise<IResponse>;

  getCourseLessons(courseId: string, studentId: string): Promise<IResponse>;

  getEnrolledCourse(courseId: string, studentId: string): Promise<IResponse>;
  getCourseLessons(courseId: string, studentId: string, userRole?: string): Promise<IResponse>;

  getEnrolledCourseDetails(userId: string, courseId: string): Promise<IResponse>;
  updateLessonProgress(userId: string, courseId: string, lessonId: string, status: string): Promise<IResponse>;


}

export interface IPaymentService {
  createCheckoutSession(courseId: string, userId: string): Promise<string>;
  verifyPayment(sessionId: string): Promise<{ userId: string; courseId: string; instructorId?: string }>;
  getPaymentHistory(userId: string): Promise<{ success: boolean; message: string; data: any[] }>;
}

export interface IWalletService {
  creditInstructorWallet(
    instructorId: string,
    amount: number,
    description: string,
    courseId?: string
  ): Promise<void>;
  getWalletByUserId(userId: string): Promise<IWallet | null>;
}

export interface IReviewService {
  addReview(courseId: string, studentId: string, rating: number, reviewText: string): Promise<any>;
  getReviewsByCourse(courseId: string): Promise<any>;
  updateReview(reviewId: string, studentId: string, rating: number, reviewText: string): Promise<any>;
  deleteReview(reviewId: string, studentId: string): Promise<any>;
}