import { IEnrollment } from "../interfaces/IEnrollment";
import EnrollmentRepository from "../repositories/enrollmentRepository";
import { enrollmentModel } from "../models/enrollmentModel";
import { IEnrollmentService } from "../interfaces/IServices";
import { ObjectId } from 'mongodb';
import CourseRepository from "../repositories/courseRepository";
import { Types } from 'mongoose';
import { UserService } from "./userServices";
import LessonRepository from "../repositories/lessonRepository";
import { IResponse } from "../interfaces/IResponse";
import ChatRepository from "../repositories/chatRepository";



export class EnrollmentService implements IEnrollmentService {
  constructor(
    private readonly _enrollmentRepository: EnrollmentRepository,
    private readonly _courseRepository: CourseRepository,

     private _userService: UserService,
     private _lessonRepository: LessonRepository,
     private readonly _chatRepository: ChatRepository


  ) {}



  async enrollUser(userId: string, courseId: string): Promise<IEnrollment> {
    try {
      console.log('Validating ObjectIds:', { userId, courseId });
      new ObjectId(userId); 
      new ObjectId(courseId); 
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

            // Add student to the course's chat room
            console.log('Adding student to chat room for courseId:', courseId, 'userId:', userId);
            const chatRoom = await this._chatRepository.addParticipant(courseId, userId);
            if (!chatRoom) {
              console.error('Chat room not found for courseId:', courseId);
              throw new Error('Failed to add student to chat room: Chat room not found');
            }
            console.log('Student added to chat room successfully:', chatRoom);

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
      new ObjectId(userId); 
      new ObjectId(courseId); 

      const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      return !!enrollment;
    } catch (error: any) {
      console.error('Error in EnrollmentService.checkEnrollment:', error);
      throw new Error(error.message || 'Failed to check enrollment');
    }
  }





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
      
      
      const enrollments = await this._enrollmentRepository.findByUser(objectIdUser);
      
      if (!enrollments || enrollments.length === 0) {
        return {
          courses: [],
          totalCourses: 0,
          currentPage: page,
          totalPages: 0,
        };
      }
  
      
      const courseIds = enrollments.map((enrollment) => enrollment.courseId);
      
      
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
  
      
      const coursesWithEnrollmentData = await Promise.all(
        courses.map(async (course) => {
          
          const enrollment = enrollments.find(
            (e) => e.courseId.toString() === course._id.toString()
          );
  
          
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
      
      const enrollment = await this._enrollmentRepository.findEnrollment(studentId, courseId);
      
      if (!enrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
          data: null,
        };
      }

      
      const course = await this._courseRepository.findByIdWithPopulate(courseId);
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          data: null,
        };
      }

      
      if (course.thumbnail) {
        const key = course.thumbnail.split('.amazonaws.com/')[1];
        course.thumbnail = await this._userService.getDownloadUrl(key);
      }

      
      const totalLessons = course.lessons?.length || 0;
      
   

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
      
      const enrollment = await this._enrollmentRepository.findEnrollment(studentId, courseId);
      
      if (!enrollment) {
        return {
          success: false,
          message: 'You are not enrolled in this course',
          data: null,
        };
      }

     
      const course = await this._courseRepository.findById(courseId);
      
      if (!course) {
        return {
          success: false,
          message: 'Course not found',
          data: null,
        };
      }

      
      const lessons = await this._lessonRepository.findLessonsByCourseId(courseId);

      
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
              return { 
                ...lesson.toObject ? lesson.toObject() : lesson, 
                video: downloadUrl 
              };
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


  async getInstructorStats(instructorId: string) {
    try {
      
      const totalCourses = await this._courseRepository.getTotalCoursesByInstructor(instructorId);

      
      const publishedCourses = await this._courseRepository.getPublishedCoursesByInstructor(instructorId);

      
      const courseIds = await this._courseRepository.getCourseIdsByInstructor(instructorId);

      
      const totalStudents = await this._enrollmentRepository.getTotalStudentsByCourses(courseIds);

      
      const courseCreationData = await this._courseRepository.getCourseCreationTimeline(instructorId);

      return {
        success: true,
        data: {
          totalCourses,
          publishedCourses,
          totalStudents,
          courseCreationData,
        },
      };
    } catch (error: any) {
      console.error('Error in InstructorService.getInstructorStats:', error);
      return {
        success: false,
        data: {
          totalCourses: 0,
          publishedCourses: 0,
          totalStudents: 0,
          courseCreationData: [],
        },
        message: error.message || 'Failed to fetch instructor stats',
      };
    }
  }
  
}