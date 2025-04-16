import { IEnrollment } from "../interfaces/IEnrollment";
import EnrollmentRepository from "../repositories/enrollmentRepository";
import { enrollmentModel } from "../models/enrollmentModel";
import { IEnrollmentService } from "../interfaces/IServices";
import { ObjectId } from 'mongodb';
import CourseRepository from "../repositories/courseRepository";
import { Types } from 'mongoose';
import { UserService } from "./userServices";
import LessonRepository from "../repositories/lessonRepository";



export class EnrollmentService implements IEnrollmentService {
  constructor(
    private readonly _enrollmentRepository: EnrollmentRepository,
    private readonly _courseRepository: CourseRepository,
     private _userService: UserService,
     private _lessonRepository: LessonRepository,


  ) {}



  async enrollUser(userId: string, courseId: string): Promise<IEnrollment> {
    try {
      console.log('Validating ObjectIds:', { userId, courseId });
      new ObjectId(userId); // Throws if invalid
      new ObjectId(courseId); // Throws if invalid
      console.log('ObjectIds validated successfully');
  
      console.log('Checking existing enrollment for userId:', userId, 'courseId:', courseId);
      const existingEnrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (existingEnrollment) {
        console.log('User is already enrolled, skipping re-enrollment');
        return existingEnrollment;
      }
  
      console.log('Creating new enrollment with data:', {
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        enrolledAt: new Date(),
        completionStatus: 'enrolled',
      });
      const enrollment = await this._enrollmentRepository.create({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        enrolledAt: new Date(),
        completionStatus: 'enrolled',
      });
      console.log('Enrollment created successfully:', enrollment);
      return enrollment;
    } catch (error: any) {
      console.error('Detailed error in EnrollmentService.enrollUser:', {
        message: error.message,
        stack: error.stack,
        userId,
        courseId,
      });
      throw new Error(error.message || 'Failed to enroll user');
    }
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    try {
      new ObjectId(userId); // Throws if invalid
      new ObjectId(courseId); // Throws if invalid

      const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      return !!enrollment;
    } catch (error: any) {
      console.error('Error in EnrollmentService.checkEnrollment:', error);
      throw new Error(error.message || 'Failed to check enrollment');
    }
  }


// async enrollUser(userId: string, courseId: string): Promise<IEnrollment> {
//     try {
//       let objectIdUser: ObjectId, objectIdCourse: ObjectId;
//       try {
//         objectIdUser = new ObjectId(userId);
//         objectIdCourse = new ObjectId(courseId);
//       } catch (err) {
//         throw new Error('Invalid userId or courseId format');
//       }

//       const existingEnrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
//       if (existingEnrollment) return existingEnrollment;

//       const enrollment = await this._enrollmentRepository.create({
//         userId: objectIdUser,
//         courseId: objectIdCourse,
//         enrolledAt: new Date(),
//         completionStatus: 'enrolled',
//       });
//       return enrollment;
//     } catch (error: any) {
//       console.error('Error in EnrollmentService.enrollUser:', { message: error.message, userId, courseId });
//       throw new Error(error.message || 'Failed to enroll user');
//     }
//   }

//   async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
//     try {
//       new ObjectId(userId);
//       new ObjectId(courseId);
//       const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
//       return !!enrollment;
//     } catch (error: any) {
//       console.error('Error in EnrollmentService.checkEnrollment:', error);
//       throw new Error(error.message || 'Failed to check enrollment');
//     }
//   }


// EnrollmentService.js
async getEnrolledCourses(
    userId: string,
    page: number = 1,
    limit: number = 6,
    search: string = '',
    sortBy: string = 'newest',
    category: string = '',
    priceRange: string = '',
    language: string = ''
  ): Promise<{
    courses: any[];
    totalCourses: number;
    currentPage: number;
    totalPages: number;
  }> {
    try {
      const objectIdUser = new Types.ObjectId(userId);
      
      // First get all enrollment IDs for the user
      const enrollments = await this._enrollmentRepository.findByUser(objectIdUser);
      
      if (!enrollments || enrollments.length === 0) {
        return {
          courses: [],
          totalCourses: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
  
      // Get the course IDs from enrollments
      const courseIds = enrollments.map((enrollment) => enrollment.courseId);
      
      // Fetch filtered and paginated courses
      const { courses, total } = await this._courseRepository.findEnrolledCourses(
        courseIds,
        page,
        limit,
        search,
        sortBy,
        category,
        priceRange,
        language
      );
  
      // Map enrollments data to courses
      const coursesWithEnrollmentData = await Promise.all(
        courses.map(async (course) => {
          // Find matching enrollment
          const enrollment = enrollments.find(
            (e) => e.courseId.toString() === course._id.toString()
          );
  
          // Generate thumbnail URL if needed
          let thumbnailUrl = course.thumbnail;
          if (thumbnailUrl && thumbnailUrl.includes(".amazonaws.com/")) {
            const key = thumbnailUrl.split(".amazonaws.com/")[1];
            thumbnailUrl = await this._userService.getDownloadUrl(key);
          }
  
          return {
            _id: course._id,
            title: course.title,
            description: course.description,
            thumbnail: thumbnailUrl,
            price: course.price,
            language: course.language,
            category: course.category,
            instructor: course.instructor,
            enrolledAt: enrollment?.enrolledAt,
            completionStatus: enrollment?.completionStatus,
            progress: enrollment?.progress || { completedLessons: [], overallCompletionPercentage: 0 },
          };
        })
      );
  
      return {
        courses: coursesWithEnrollmentData,
        totalCourses: total,
        currentPage: page,
        totalPages: Math.ceil(total / limit),
      };
    } catch (error: any) {
      console.error('Error in EnrollmentService.getEnrolledCourses:', { 
        message: error.message, 
        userId 
      });
      throw new Error(error.message || 'Failed to fetch enrolled courses');
    }
  }

  async getEnrolledCourse(courseId: string, studentId: string) {
    try {
      // Check if the student is enrolled in this course
      const enrollment = await this._enrollmentRepository.findEnrollment(studentId, courseId);
      
      if (!enrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
          data: null,
        };
      }

      // Get the course details
      const course = await this._courseRepository.findByIdWithPopulate(courseId);
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          data: null,
        };
      }

      // Get thumbnail URL if exists
      if (course.thumbnail) {
        const key = course.thumbnail.split('.amazonaws.com/')[1];
        course.thumbnail = await this._userService.getDownloadUrl(key);
      }

      // Get student progress for this course
    //   const progress = await this._progressRepository.findProgress(studentId, courseId);
      
      // Get total lessons count
      const totalLessons = course.lessons?.length || 0;
      
      // Calculate progress percentage
    //   const progressData = {
    //     completedLessons: progress?.completedLessons || [],
    //     progress: totalLessons > 0 
    //       ? Math.round(((progress?.completedLessons?.length || 0) / totalLessons) * 100) 
    //       : 0
    //   };

      return {
        success: true,
        message: 'Enrolled course fetched successfully',
        data: {
          ...course,
        //   ...progressData
        },
      };
    } catch (error: any) {
      console.error('Error fetching enrolled course:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch course details',
        data: null,
      };
    }
  }

  async getCourseLessons(courseId: string, studentId: string) {
    try {
      // Check if the student is enrolled in this course
      const enrollment = await this._enrollmentRepository.findEnrollment(studentId, courseId);
      
      if (!enrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
          data: null,
        };
      }

      // Get the course to ensure it exists
      const course = await this._courseRepository.findById(courseId);
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          data: null,
        };
      }

      // Get all lessons for this course
      const lessons = await this._lessonRepository.findLessonsByCourseId(courseId);

      // Get fresh video URLs for each lesson
      const updatedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          if (lesson.video) {
            try {
              let key = lesson.video;
              if (lesson.video.includes('.amazonaws.com/')) {
                key = lesson.video.split('.amazonaws.com/')[1];
              } else if (lesson.video.startsWith('http')) {
                // Handle other URL formats if necessary
                const url = new URL(lesson.video);
                key = url.pathname.substring(1); // Remove leading "/"
              }
              
              // Generate a fresh pre-signed URL with a long expiration
              const downloadUrl = await this._userService.videogetDownloadUrl(key);
              return { 
                ...lesson.toObject ? lesson.toObject() : lesson, 
                video: downloadUrl 
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
        message: "Course lessons fetched successfully",
        data: updatedLessons,
      };
    } catch (error: any) {
      console.error("Error fetching course lessons:", error);
      return {
        success: false,
        message: error.message || "Failed to fetch lessons",
        data: null,
      };
    }
  }

  async getEnrolledCourseById(courseId: string, userId: string) {
    try {
      const isEnrolled = await this._enrollmentRepository.checkEnrollment(userId, courseId);
      if (!isEnrolled) {
        return {
          success: false,
          message: 'Not enrolled in this course',
          data: null,
        };
      }

      const course = await this._courseRepository.findStudentEnrolledCourseById(courseId);

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
        const key = course.thumbnail.split('.amazonaws.com/')[1];
        const downloadUrl = await this._userService.getDownloadUrl(key);
        course.thumbnail = downloadUrl;
      }

      return {
        success: true,
        message: 'Enrolled course fetched successfully',
        data: course,
      };
    } catch (error: any) {
      console.error('Error in EnrolledCourseService.getEnrolledCourseById:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch enrolled course',
        data: null,
      };
    }
  }

  async getEnrolledLessonsByCourseId(courseId: string, userId: string) {
    try {
      const isEnrolled = await this._enrollmentRepository.checkEnrollment(userId, courseId);
      if (!isEnrolled) {
        return {
          success: false,
          message: 'Not enrolled in this course',
          data: null,
        };
      }

      const lessons = await this._lessonRepository.findLessonsByCourseId(courseId);

      if (!lessons || lessons.length === 0) {
        return {
          success: false,
          message: 'Lessons not found',
          data: null,
        };
      }

      const updatedLessons = await Promise.all(
        lessons.map(async (lesson) => {
          if (lesson.video) {
            try {
              let key = lesson.video;
              if (lesson.video.includes('.amazonaws.com/')) {
                key = lesson.video.split('.amazonaws.com/')[1];
              } else if (lesson.video.startsWith('http')) {
                const url = new URL(lesson.video);
                key = url.pathname.substring(1);
              }
              const downloadUrl = await this._userService.videogetDownloadUrl(key);
              return { ...lesson, video: downloadUrl };
            } catch (error) {
              console.error(`Error getting download URL for lesson ${lesson._id}:`, error);
              return lesson;
            }
          }
          return lesson;
        })
      );

      return {
        success: true,
        message: 'Enrolled lessons fetched successfully',
        data: updatedLessons,
      };
    } catch (error: any) {
      console.error('Error in EnrolledCourseService.getEnrolledLessonsByCourseId:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch enrolled lessons',
        data: null,
      };
    }
  }


  async getEnrolledCourseDetails(userId: string, courseId: string) {
    try {
      new ObjectId(userId);
      new ObjectId(courseId);

      const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (!enrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
          course: null,
          enrollment: null,
        };
      }

      const course = await this._courseRepository.findByIdWithPopulate(courseId);
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          course: null,
          enrollment: null,
        };
      }

      if (course.thumbnail) {
        const key = course.thumbnail.split('.amazonaws.com/')[1];
        course.thumbnail = await this._userService.getDownloadUrl(key);
      }

      return {
        success: true,
        message: 'Enrolled course details fetched successfully',
        course,
        enrollment,
      };
    } catch (error: any) {
      console.error('Error in EnrollmentService.getEnrolledCourseDetails:', error);
      return {
        success: false,
        message: error.message || 'Failed to fetch course details',
        course: null,
        enrollment: null,
      };
    }
  }

  async updateLessonProgress(userId: string, courseId: string, lessonId: string, status: string) {
    try {
      new ObjectId(userId);
      new ObjectId(courseId);
      new ObjectId(lessonId);

      const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (!enrollment) {
        return {
          success: false,
          message: 'Enrollment not found',
          enrollment: null,
        };
      }

      if (status !== 'completed') {
        return {
          success: false,
          message: 'Invalid status. Only "completed" is supported',
          enrollment: null,
        };
      }

      if (!enrollment.progress.completedLessons.includes(new ObjectId(lessonId))) {
        enrollment.progress.completedLessons.push(new ObjectId(lessonId));
        const totalLessons = await this._lessonRepository.countLessonsByCourse(courseId);
        enrollment.progress.overallCompletionPercentage = Math.round((enrollment.progress.completedLessons.length / totalLessons) * 100);

        if (enrollment.progress.overallCompletionPercentage >= 100) {
          enrollment.completionStatus = 'completed';
        }

        const updatedEnrollment = await this._enrollmentRepository.update(enrollment._id, enrollment);
        return {
          success: true,
          message: 'Lesson progress updated successfully',
          enrollment: updatedEnrollment,
        };
      }

      return {
        success: true,
        message: 'Lesson already marked as completed',
        enrollment,
      };
    } catch (error: any) {
      console.error('Error in EnrollmentService.updateLessonProgress:', error);
      return {
        success: false,
        message: error.message || 'Failed to update lesson progress',
        enrollment: null,
      };
    }
  }
}