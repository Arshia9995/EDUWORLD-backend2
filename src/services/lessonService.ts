import { ICourse } from "../interfaces/ICourse";
import LessonRepository from "../repositories/lessonRepository";
import { ILessonService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import { ILesson } from "../interfaces/ILesson";
import { UserService } from "./userServices";


export class LessonServices implements ILessonService {
    constructor(
        private _lessonRepository: LessonRepository,
        private _courseRepository: CourseRepository,
        private _userService: UserService

    ){
        this._lessonRepository = _lessonRepository;
        this._courseRepository = _courseRepository;
        this._userService = _userService;

    }

    async addLesson(lessonData: Partial<ILesson>, instructorId: string) {
        try {
          // Validate required fields
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
    
          // Verify the course exists
          const courseId = lessonData.course.toString();
          const course = await this._courseRepository.findById(courseId);
          
          if (!course) {
            return {
              success: false,
              message: "Course not found",
              data: null,
            };
          }
    
          // Check if the course has an instructor assigned
          if (!course.instructor) {
            return {
              success: false,
              message: "Course not found or has no instructor assigned",
              data: null,
            };
          }
    
          // Check if the instructor is authorized to add lessons to this course
          if (course.instructor.toString() !== instructorId) {
            return {
              success: false,
              message: "Unauthorized: You are not the instructor of this course",
              data: null,
            };
          }
    
          // Create the lesson
          const lesson = await this._lessonRepository.create(lessonData);
    
          // Initialize lessons array if it doesn't exist
          if (!course.lessons) {
            course.lessons = [];
          }
    
          // Update the course with the new lesson
          course.lessons.push(lesson._id);
          
          // Since we're using mongoose Documents, we can use the save method
          // or pass the updated lessons array to the update method
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
          // Verify the course exists and the instructor is authorized
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
    
          // Fetch lessons for the course
          const lessons = await this._lessonRepository.findLessonsByCourseId(courseId);
    
          // Refresh video URLs for each lesson
          const updatedLessons = await Promise.all(
            lessons.map(async (lesson) => {
              if (lesson.video) {
                const key = lesson.video.split(".amazonaws.com/")[1];
                const downloadUrl = await this._userService.getDownloadUrl(key);
                return { ...lesson, video: downloadUrl };
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







}
