import { ICourse } from "../interfaces/ICourse";
import CourseRepository from "../repositories/courseRepository";
import { ICourseService } from "../interfaces/IServices";
import { UserService } from "./userServices";
import { Types } from 'mongoose';
import { EnrollmentService } from "./enrollmentService";
import ChatRepository from "../repositories/chatRepository";

export class CourseServices implements ICourseService {
    constructor(
        private _courseRepository: CourseRepository,
        private _userService: UserService,
        private _enrollmentService: EnrollmentService,
        private _chatRepository: ChatRepository
    ){
        this._courseRepository =  _courseRepository;
        this._userService = _userService;
        this._enrollmentService = _enrollmentService;
        this._chatRepository = _chatRepository;
    }


    async addCourse(courseData: Partial<ICourse>) {
        try {
         
          if (
            !courseData.title ||
            !courseData.description ||
            !courseData.instructor ||
            !courseData.category
          ) {
            return { success: false, message: 'Missing required fields', data: null };
          }  
    
         
           
          const course = await this._courseRepository.create(courseData);


          // if(courseData.title === course.title){
          //   return {
          //     success: false,
          //     message: "you can not add the course with same title",
          //     data : null
          //   }
          // }
       


          return {
            success: true,
            message: 'Course created successfully',
            data: course,
          };
        } catch (error) {
          console.error('Error adding course:', error);
          return { success: false, message: 'Internal server error', data: null };
        }
      }

      async publishCourse(courseId: string, instructorId: string) {
        try {
         
          const course = await this._courseRepository.findById(courseId);
          if (!course) {
            return {
              success: false,
              message: "Course not found",
              data: null,
            };
          }
    
          
          if (!course.instructor || course.instructor.toString() !== instructorId) {
            return {
              success: false,
              message: "Unauthorized: You are not the instructor of this course",
              data: null,
            };
          }
    
         
          if (!course.lessons || course.lessons.length === 0) {
            return {
              success: false,
              message: "Cannot publish course: At least one lesson is required",
              data: null,
            };
          }
    
         
          if (!course.thumbnail) {
            return {
              success: false,
              message: "Cannot publish course: A thumbnail is required",
              data: null,
            };
          }
    
          
          if (course.isPublished) {
            return {
              success: true,
              message: "Course is already published",
              data: course,
            };
          }
    
          
          course.isPublished = true;
          const updatedCourse = await this._courseRepository.update(courseId, {
            isPublished: true,
          });

                // Create chat room for the course
      const existingChat = await this._chatRepository.findByCourseId(courseId);
      if (!existingChat) {
        await this._chatRepository.createChatRoom(courseId, instructorId);
      }
    
          return {
            success: true,
            message: "Course published successfully and chat room created",
            data: updatedCourse,
          };
        } catch (error: any) {
          console.error("Error publishing course:", error);
          return {
            success: false,
            message: error.message || "Internal server error",
            data: null,
          };
        }
      }

      async getPublishedCoursesByInstructor(
        instructorId: string,
        page: number = 1,
        limit: number = 6,
        search: string = '',
        sortBy: string = 'newest',
        category: string = '',
        priceRange: string = '',
        language: string = ''
      ) {
        try {
          const { courses, total } = await this._courseRepository.findPublishedByInstructor(
            instructorId,
            page,
            limit,
            search,
            sortBy,
            category,
            priceRange,
            language
          );
          
          
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
                const key = course.thumbnail.split(".amazonaws.com/")[1];
                const downloadUrl = await this._userService.getDownloadUrl(key);
                return { ...course.toObject(), thumbnail: downloadUrl };
              }
              return course.toObject();
            })
          );
          
          return {
            success: true,
            message: "Published courses fetched successfully",
            data: updatedCourses,
            totalCourses: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          };
        } catch (error: any) {
          console.error("Error fetching published courses:", error);
          return {
            success: false,
            message: error.message || "Internal server error",
            data: null,
            totalCourses: 0,
            currentPage: page,
            totalPages: 0,
          };
        }
      }


      async getCourseById(courseId: string, instructorId: string) {
        try {
            const course = await this._courseRepository.findByIdWithPopulate(courseId);
      
          if (!course) {
            return {
              success: false,
              message: 'Course not found',
              data: null,
            };
        }
        const instructorRef =
  course?.instructor && typeof course.instructor === "object" 
    ? course.instructor._id // Normalize to ObjectId
    :new Types.ObjectId(course.instructor); // For string cases
    const instructor_Id=new Types.ObjectId(instructorId)
    console.log(instructorRef,instructor_Id,"thjis is the id")
          // Check if the instructor is authorized to access this course
          if (!course.instructor || !instructor_Id.equals(instructorRef)) {
            return {
              success: false,
              message: 'Unauthorized: You are not the instructor of this course',
              data: null,
            };
          }
      
         
          if (course.thumbnail) {
            const key = course.thumbnail.split('.amazonaws.com/')[1];
            course.thumbnail = await this._userService.getDownloadUrl(key);
          }
      
          return {
            success: true,
            message: 'Course details fetched successfully',
            data: course,
          };
        } catch (error: any) {
          console.error('Error fetching course by ID:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch course details',
            data: null,
          };
        }
      }

      async getAllPublishedCourses(
        page: number = 1, 
        limit: number = 6, 
        search: string = '', 
        sortBy: string = 'newest', 
        category: string = '', 
        priceRange: string = '', 
        language: string = ''
      ) {
        try {
          const { courses, total } = await this._courseRepository.findAllPublishedCourses(
            page, 
            limit, 
            search, 
            sortBy, 
            category, 
            priceRange, 
            language
          );
      
          
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
                const key = course.thumbnail.split(".amazonaws.com/")[1];
                const downloadUrl = await this._userService.getDownloadUrl(key);
                return { ...course, thumbnail: downloadUrl };
              }
              return course;
            })
          );
      
          return {
            success: true,
            message: 'Published courses fetched successfully',
            data: updatedCourses,
            totalCourses: total,
            currentPage: page,
            totalPages: Math.ceil(total / limit),
          };
        } catch (error: any) {
          console.error('Error in CourseService.getAllPublishedCourses:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch published courses',
            data: null,
            totalCourses: 0,
            currentPage: page,
            totalPages: 0,
          };
        }
      }
      

      async getStudentCourseById(courseId: string) {
        try {
          const course = await this._courseRepository.findStudentCourseById(courseId);
    
          if (!course) {
            return {
              success: false,
              message: 'Course not found',
              data: null,
            };
          }
    
        
          if (!course.isPublished || course.isBlocked) {
            return {
              success: false,
              message: 'Course is not available',
              data: null,
            };
          }
    
         
          if (course.thumbnail) {
            const key = course.thumbnail.split(".amazonaws.com/")[1];
            const downloadUrl = await this._userService.getDownloadUrl(key);
            course.thumbnail = downloadUrl;
          }
    
          return {
            success: true,
            message: 'Course fetched successfully',
            data: course,
          };
        } catch (error: any) {
          console.error('Error in CourseService.getStudentCourseById:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch course',
            data: null,
          };
        }
      }

      async updateCourse(courseId: string, userId: string, updateData: ICourse) {
        try {
          
          const course = await this._courseRepository.findById(courseId);

          // const existingCourse = await this._courseRepository.findByQuery({title: "gbgfn"})

          // if(existingCourse?._id === new ObectId(courseId)){
          //   return {
          //     success: false,
          //     message: "you can not add the course with same title",
          //     data: null
          //   }

          // }

          

         


      
          if (!course) {
            return {
              success: false,
              message: 'Course not found',
              data: null,
            };
          }


      
          
          if (course.instructor._id.toString() !== userId) {
            return {
              success: false,
              message: 'Unauthorized: You can only update your own courses',
              data: null,
            };
          }
      

         
            
          
          
          const updatedCourse = await this._courseRepository.update(courseId, updateData);



      
          if (!updatedCourse) {
            return {
              success: false,
              message: 'Failed to update course',
              data: null,
            };
          }
      
          return {
            success: true,
            message: 'Course updated successfully',
            data: updatedCourse,
          };
        } catch (error: any) {
          console.error('Error in CourseService.updateCourse:', error);
          return {
            success: false,
            message: error.message || 'Failed to update course',
            data: null,
          };
        }
      }

      async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
        try {
          return await this._enrollmentService.checkEnrollment(userId, courseId);
        } catch (error: any) {
          console.error('Error in CourseService.checkEnrollment:', error);
          throw new Error(error.message || 'Failed to check enrollment');
        }
      }

    

      


}
