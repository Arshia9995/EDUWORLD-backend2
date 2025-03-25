import { ICourse } from "../interfaces/ICourse";
import CourseRepository from "../repositories/courseRepository";
import { ICourseService } from "../interfaces/IServices";
import { UserService } from "./userServices";
import { Types } from 'mongoose';

export class CourseServices implements ICourseService {
    constructor(
        private _courseRepository: CourseRepository,
        private _userService: UserService
    ){
        this._courseRepository =  _courseRepository;
        this._userService = _userService;
    }


    async addCourse(courseData: Partial<ICourse>) {
        try {
          // Validate required fields
          if (
            !courseData.title ||
            !courseData.description ||
            !courseData.instructor ||
            !courseData.category
          ) {
            return { success: false, message: 'Missing required fields', data: null };
          }
    
          // Create the course in the database
          const course = await this._courseRepository.create(courseData);
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
          // Verify the course exists
          const course = await this._courseRepository.findById(courseId);
          if (!course) {
            return {
              success: false,
              message: "Course not found",
              data: null,
            };
          }
    
          // Check if the instructor is authorized to publish this course
          if (!course.instructor || course.instructor.toString() !== instructorId) {
            return {
              success: false,
              message: "Unauthorized: You are not the instructor of this course",
              data: null,
            };
          }
    
          // Validation: Ensure the course has at least one lesson
          if (!course.lessons || course.lessons.length === 0) {
            return {
              success: false,
              message: "Cannot publish course: At least one lesson is required",
              data: null,
            };
          }
    
          // Validation: Ensure the course has a thumbnail
          if (!course.thumbnail) {
            return {
              success: false,
              message: "Cannot publish course: A thumbnail is required",
              data: null,
            };
          }
    
          // Validation: Ensure the course is not already published
          if (course.isPublished) {
            return {
              success: false,
              message: "Course is already published",
              data: null,
            };
          }
    
          // Update the course to set isPublished to true
          course.isPublished = true;
          const updatedCourse = await this._courseRepository.update(courseId, {
            isPublished: true,
          });
    
          return {
            success: true,
            message: "Course published successfully",
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

      async getPublishedCoursesByInstructor(instructorId: string) {
        try {
          const courses = await this._courseRepository.findPublishedByInstructor(instructorId);

          // Generate pre-signed URLs for thumbnails
      const updatedCourses = await Promise.all(
        courses.map(async (course) => {
          if (course.thumbnail) {
            // Extract the S3 key from the permanent URL (imageUrl)
            const key = course.thumbnail.split(".amazonaws.com/")[1];
            // Generate a fresh pre-signed download URL using UserService
            const downloadUrl = await this._userService.getDownloadUrl(key);
            // Return the course with the updated thumbnail URL
            return { ...course.toObject(), thumbnail: downloadUrl };
          }
          return course.toObject();
        })
      );

          return {
            success: true,
            message: "Published courses fetched successfully",
            data: updatedCourses,
          };
        } catch (error: any) {
          console.error("Error fetching published courses:", error);
          return {
            success: false,
            message: error.message || "Internal server error",
            data: null,
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
      
          // Refresh thumbnail URL if it exists
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

      async getAllPublishedCourses() {
        try {
          const courses = await this._courseRepository.findAllPublishedCourses();
    
          // Generate pre-signed URLs for thumbnails
          const updatedCourses = await Promise.all(
            courses.map(async (course) => {
              if (course.thumbnail) {
                // Extract the S3 key from the permanent URL (thumbnail)
                const key = course.thumbnail.split(".amazonaws.com/")[1];
                // Generate a fresh pre-signed download URL using UserService
                const downloadUrl = await this._userService.getDownloadUrl(key);
                // Return the course with the updated thumbnail URL
                return { ...course, thumbnail: downloadUrl };
              }
              return course;
            })
          );
    
          return {
            success: true,
            message: 'Published courses fetched successfully',
            data: updatedCourses,
          };
        } catch (error: any) {
          console.error('Error in CourseService.getAllPublishedCourses:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch published courses',
            data: null,
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
    
          // Check if the course is published and not blocked
          if (!course.isPublished || course.isBlocked) {
            return {
              success: false,
              message: 'Course is not available',
              data: null,
            };
          }
    
          // Generate pre-signed URL for thumbnail if it exists
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
          // Fetch the existing course
          const course = await this._courseRepository.findById(courseId);
      
          if (!course) {
            return {
              success: false,
              message: 'Course not found',
              data: null,
            };
          }
      
          // Ensure the instructor can only update their own course
          if (course.instructor._id.toString() !== userId) {
            return {
              success: false,
              message: 'Unauthorized: You can only update your own courses',
              data: null,
            };
          }
      
          // Update the course with the provided data
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

      


}
