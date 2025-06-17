export const USER_ROUTES = {
    SIGN_UP: "/signup",
    VERIFY_OTP: "/verifyotp",
    LOGIN: "/login",
    GOOGLE_LOGIN: "/google-login",
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

    VIDEO_GETS3URL:"/videoget-s3-url",

    GETINSTRUCTORBYID: "/getinstructorbyid/:id",
    FETCH_ALL_CATEGORY: "/fetchallcategories",
    ADD_COURSE: "/addcourse",
    ADD_LESSON: "/addlesson",
    PUBLISH_COURSE: "/publishcourse",
    GET_PUBLISHED_COURSES: "/getpublishedcourses",
    GET_DRAFT_COURSES: "/getdraftcourses",

    GET_COURSE_BYID:  "/getcoursebyid/:courseId",
    GET_LESSONS_BY_COURSEID:"/getlessonbycourseid/:courseId",
    GET_UPDATE_LESSONS_BY_COURSEID:"/updategetlessonbycourseid/:courseId",

    GET_ALL_PUBLISHED_COURSES: "/getallpublishedcourses",
    GET_STUDENT_COURSE_BYID: "/getstudentcoursebyid/:courseId",
    GET_STUDENT_LESSON_BY_COURSEID: "/getstudentlessonbycourseid/:courseId",
    UPDATE_COURSE: "/updatecourse/:courseId",
    UPDATE_LESSON: "/updatelesson/:lessonId",
    DELETE_LESSON: "/deletelesson/:lessonId",

    CREATE_CHECKOUT_SESSION: "/create-checkout-session",
    VERIFY_PAYMENT: "/verify-payment",

    WEBHOOK_PAYMENT: "/webhook-payment",
    
    CHECK_ENROLLMENT: "/check-enrollment/:courseId",
    CREATE_ENROLLMENT: "/create-enrollment",
    ENROLLED_COURSES: "/enrolled-courses",


    GET_ENROLLED_COURSES_DETAILS: "/enrolled-course-details/:courseId",
    GET_ENROLLED_LESSON_DETAILS: "/enrolled-course-lessons/:courseId",
    ENROLLED_COURSE_DETAILS: "/enrolled-course-detailss/:courseId",
    UPDATE_LESSON_PROGRESS: "/update-lesson-progress",

    PAYMENT_HISTORY: "/payment-history",

    INSTRUCTOR_WALLET: "/instructorwallet",

    ADD_REVIEW: "/courses/:courseId/reviews",
    GET_REVIEW: "/courses/:courseId/getreviews",
    GET_PROFILE: "/profile",
    INSTRUCTOR_STATS:'/instructor-stats',

    RETRY_PAYMENT:"/retry-payment",
    // GET_MY_COURSES: "/mycourses",

    GET_CHAT_BY_COURSE_ID: "/getchat/:courseId",
    GET_MESSAGES_BY_CHAT_ID: "/:chatId/getmessages",
    CREATE_MESSAGES: "/:chatId/createmessages",

    
    // MARK_MESSAGES_AS_READ: "/:chatId/markasread",

   
    // INSTRUCTOR_GET_MY_COURSES: "/instructors/mycourses",
    // INSTRUCTOR_GET_CHAT_BY_COURSE_ID: "/instructors/getchat/:courseId",
    // INSTRUCTOR_GET_MESSAGES_BY_CHAT_ID: "/instructors/:chatId/getmessages",
    // INSTRUCTOR_CREATE_MESSAGES: "/instructors/:chatId/createmessages",
    // MARK_MESSAGES_AS_READ: "/:chatId/markasread",


    // GET_INSTRUCTOR_CHATS: "/chat/instructor/chats",
    // GET_INSTRUCTOR_CHAT_BY_COURSEID: "/getchat/:courseId",
    // INSTRUCTOR_GET_MESSAGES: "/:chatId/getmessages",
    // INSTRUCTOR_SEND_MESSAGES:'/:chatId/createmessages'

    INSTRUCTOR_CHATS:"/instructor/chats",
    INSTRUCTOR_MESSAGES: "/messages/:chatId",
    INSTRUCTOR_SEND_MESSAGE: "/send-message",

    GET_ACTIVE_ANNOUNCEMENTS: "/getactiveannouncements",
    MARK_MESSAGE_AS_READ: "/messages/:chatId/read"
    


   


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
    
    ADMIN_STATS: "/admin-stats",

    ADMIN_WALLET: "/admin-wallet",

    COURSE_STATS: "/course-stats",
    GET_ALL_PAYMENT_HISTORY: "/get-all-payment-history",

    CREATE_ANNOUNCEMENTS: "/create-announcements",
    GET_ANNOUNCEMENTS: "/getannouncements",
    DEACTIVATE_ANNOUNCEMENTS: "/announcements/deactivate",
    ACTIVATE_ANNOUNCEMENTS: "/announcements/reactivate",
    UPDATE_ANNOUNCEMENTS: "/announcements/update"

   
 
}