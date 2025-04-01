import { ICourse } from "../interfaces/ICourse";
import LessonRepository from "../repositories/lessonRepository";
import { ILessonService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import { ILesson } from "../interfaces/ILesson";
import { UserService } from "./userServices";
import AWS from 'aws-sdk';
import dotenv from "dotenv";
import { log } from "console";


export class LessonServices implements ILessonService {
    private s3: AWS.S3;
    constructor(
        private _lessonRepository: LessonRepository,
        private _courseRepository: CourseRepository,
        private _userService: UserService

    ){
        this._lessonRepository = _lessonRepository;
        this._courseRepository = _courseRepository;
        this._userService = _userService;
        this.s3 = new AWS.S3({
                    accessKeyId: process.env.ACCESS_KEY,
                    secretAccessKey: process.env.SECRET_ACCESS_KEY,
                    region: process.env.AWS_REGION,
                    signatureVersion: 'v4' // Add this for newer AWS SDK versions
                });

    }

    async addLesson(lessonData: Partial<ILesson>, instructorId: string) {
        try {
         
          if (
            !lessonData.title ||
            !lessonData.description ||
            !lessonData.video ||
            !lessonData.course
          ) {
            return {
              success: false,
              message: "Title, description, video, and course are required",
              data: null,
            };
          }
    
          
          const courseId = lessonData.course.toString();
          const course = await this._courseRepository.findById(courseId);
          
          if (!course) {
            return {
              success: false,
              message: "Course not found",
              data: null,
            };
          }
    
         
          if (!course.instructor) {
            return {
              success: false,
              message: "Course not found or has no instructor assigned",
              data: null,
            };
          }
    
          
          if (course.instructor.toString() !== instructorId) {
            return {
              success: false,
              message: "Unauthorized: You are not the instructor of this course",
              data: null,
            };
          }
    
         
          const lesson = await this._lessonRepository.create(lessonData);
    
          
          if (!course.lessons) {
            course.lessons = [];
          }
    
          
          course.lessons.push(lesson._id);
          

          await this._courseRepository.update(course._id.toString(), { 
            lessons: course.lessons 
          });
    
          return {
            success: true,
            message: "Lesson added successfully",
            data: lesson,
          };
        } catch (error: any) {
          console.error("Error adding lesson:", error);
          return {
            success: false,
            message: error.message || "Internal server error",
            data: null,
          };
        }
      }


      async getLessonsByCourseId(courseId: string, instructorId: string) {
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
      
          const lessons = await this._lessonRepository.findLessonsByCourseId(courseId);
      
          const updatedLessons = await Promise.all(
            lessons.map(async (lesson) => {
              if (lesson.video) {
                try {
                  // Extract the key properly from the video URL or use the key directly
                  let key = lesson.video;
                  if (lesson.video.includes('.amazonaws.com/')) {
                    key = lesson.video.split('.amazonaws.com/')[1];
                  } else if (lesson.video.startsWith('http')) {
                    // Handle other URL formats if necessary
                    const url = new URL(lesson.video);
                    key = url.pathname.substring(1); // Remove leading "/"
                  }
                  
                  // Make sure we're passing the correct formatted key to getDownloadUrl
                  // Include folder structure if present in the key
                  console.log(`Extracted key for lesson ${lesson._id}: ${key}`);
                  
                  // Generate a fresh pre-signed URL with a long expiration
                  // const downloadUrl = await this._userService.videogetDownloadUrl(key);
                  // console.log("downloadurl",downloadUrl)
                  return { 
                    ...lesson.toObject ? lesson.toObject() : lesson, 
                    // video: downloadUrl 
                  };
                } catch (error) {
                  console.error(`Error getting download URL for lesson ${lesson._id}:`, error);
                  // Return the lesson with the original video URL if we can't get a pre-signed URL
                  return lesson;
                }
              }
              return lesson;
            })
          );
      
          return {
            success: true,
            message: "Lessons fetched successfully",
            data: updatedLessons,
          };
        } catch (error: any) {
          console.error("Error fetching lessons by course ID:", error);
          return {
            success: false,
            message: error.message || "Failed to fetch lessons",
            data: null,
          };
        }
      }

      
      async getStudentLessonsByCourseId(courseId: string, userRole: string) {
        try {
          const lessons = await this._lessonRepository.findByCourseId(courseId, userRole);
    
          if (!lessons || lessons.length === 0) {
            return {
              success: false,
              message: 'Lessons not found',
              data: null,
            };
          }
    
          return {
            success: true,
            message: 'Lessons fetched successfully',
            data: lessons,
          };
        } catch (error: any) {
          console.error('Error in LessonService.getLessonsByCourseId:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch lessons',
            data: null,
          };
        }
      }


      async updateLesson(lessonId: string, lessonData: Partial<ILesson>, instructorId: string) {
        try {
         
          const lesson = await this._lessonRepository.findById(lessonId);
          if (!lesson) {
            return {
              success: false,
              message: "Lesson not found",
              data: null,
            };
          }
          console.log("Existing lesson.course:", lesson.course.toString());
    
        
          const course = await this._courseRepository.findById(lesson.course.toString());
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
    
        
          const updatedLessonData: Partial<ILesson> = {
            title: lessonData.title || lesson.title,
            description: lessonData.description || lesson.description,
            video: lessonData.video || lesson.video,
            duration: lessonData.duration || lesson.duration,
            course: lessonData.course || lesson.course,
          };
    
          const updatedLesson = await this._lessonRepository.update(lessonId, updatedLessonData);
    
          if (!updatedLesson) {
            return {
              success: false,
              message: "Failed to update lesson",
              data: null,
            };
          }
    
          return {
            success: true,
            message: "Lesson updated successfully",
            data: updatedLesson,
          };
        } catch (error: any) {
          console.error("Error updating lesson:", error);
          return {
            success: false,
            message: error.message || "Failed to update lesson",
            data: null,
          };
        }
      }


      async deleteLesson(lessonId: string, instructorId: string) {
        try {
          // Find the lesson
          const lesson = await this._lessonRepository.findById(lessonId);
          if (!lesson) {
            return {
              success: false,
              message: "Lesson not found",
              data: null,
            };
          }
      
          // Check if the instructor is authorized to delete this lesson
          const course = await this._courseRepository.findById(lesson.course.toString());
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
      
          // Remove the lesson from the course's lessons array
          const lessonIndex = course.lessons?.findIndex(
            (id) => id.toString() === lessonId
          );
          
          if (course.lessons && lessonIndex !== undefined && lessonIndex !== -1) {
            course.lessons.splice(lessonIndex, 1);
            await this._courseRepository.update(course._id.toString(), {
              lessons: course.lessons,
            });
          }
      
          // Delete the lesson
          const isDeleted = await this._lessonRepository.delete(lessonId);
          if (!isDeleted) {
            return {
              success: false,
              message: "Failed to delete lesson",
              data: null,
            };
          }
      
          return {
            success: true,
            message: "Lesson deleted successfully",
            data: null,
          };
        } catch (error: any) {
          console.error("Error deleting lesson:", error);
          return {
            success: false,
            message: error.message || "Failed to delete lesson",
            data: null,
          };
        }
      }







}
