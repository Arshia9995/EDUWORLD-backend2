export const USER_ROUTES = {
    SIGN_UP: "/signup",
    VERIFY_OTP: "/verifyotp",
    LOGIN: "/login",
    LOGOUT: "/logout",
    GETUSERDATAFIRST: "/getUserDataFirst",
    RESEND_OTP: "/resendotp",
    FORGOT_PASSWORD: "/forgotpassword",
    FORGOTOTP_VERIFIED:"/forgototpverify",
    RESET_PASSWORD: "/resetpassword",
    UPDATE_PROFILE: "/updateprofile",
    ISEXIST: "/isexist",
    REGISTER_INSTRUCTOR: "/registerinstructor",
    GETS3URL:"/get-s3-url",
    GETINSTRUCTORBYID: "/getinstructorbyid/:id",
    FETCH_ALL_CATEGORY: "/fetchallcategories",
    ADD_COURSE: "/addcourse",
    ADD_LESSON: "/addlesson",
    PUBLISH_COURSE: "/publishcourse",
    GET_PUBLISHED_COURSES: "/getpublishedcourses",
    GET_COURSE_BYID:  "/getcoursebyid/:courseId",
    GET_LESSONS_BY_COURSEID:"/getlessonbycourseid/:courseId",
    GET_ALL_PUBLISHED_COURSES: "/getallpublishedcourses",
    GET_STUDENT_COURSE_BYID: "/getstudentcoursebyid/:courseId",
    GET_STUDENT_LESSON_BY_COURSEID: "/getstudentlessonbycourseid/:courseId",
    UPDATE_COURSE: "/updatecourse/:courseId",
    UPDATE_LESSON: "/updatelesson/:lessonId"

}

export const Admin_Routes = {
  
    ADMIN_LOGIN: "/login",
    GETALL_STUDENTS:"/getallstudents",
    BLOCK_STUDENT: "/blockstudent",
    UNBLOCK_STUDENT: "/unblockstudent",
    GETALL_INSTRUCTORS:"/getallinstructors",
    APPROVE_INSTRUCTOR: "/approveinstructor",
    REJECT_INSTRUCTOR: "/rejectinstructor",
    BLOCK_INSTRUCTOR: "/blockinstructor",
    UNBLOCK_INSTRUCTOR: "/unblockinstructor",
    ADMIN_LOGOUT: "/adminlogout",

    ADD_CATEGORY: "/addcategory",
    GET_ALL_CATEGORIES: "/getallcategories",
    EDIT_CATEGORY: "/editcategory/:id",
    BLOCK_CATEGORY: "/blockcategory/:id",
    UNBLOCK_CATEGORY: "/unblockcategory/:id",
   
 
}