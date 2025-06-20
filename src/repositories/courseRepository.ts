import mongoose from "mongoose";
import { ICourse } from "../interfaces/ICourse";
import { courseModel } from "../models/courseModel";
import { BaseRepository } from "./baseRepository";
import { Types } from 'mongoose';

class CourseRepository extends BaseRepository<ICourse>{
    constructor() {
        super(courseModel)
        
    }


    async findPublishedByInstructor(
      instructorId: string,
      page: number = 1,
      limit: number = 6,
      search: string = '',
      sortBy: string = 'newest',
      category: string = '',
      priceRange: string = '',
      language: string = ''
    ): Promise<{ courses: ICourse[]; total: number }> {
      try {
        const skip = (page - 1) * limit;
        
        
        const query: any = {
          instructor: instructorId,
          isPublished: true
        };
        
        
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        
        
        if (category) {
          query.category = category;
        }
        
        
        if (language) {
          query.language = language;
        }
        
        
        if (priceRange) {
          if (priceRange === 'free') {
            query.price = 0;
          } else {
            const [min, max] = priceRange.split('-').map(p => parseInt(p));
            if (max) {
              query.price = { $gte: min, $lte: max };
            } else if (priceRange.includes('+')) {
              const minPrice = parseInt(priceRange.replace('+', ''));
              query.price = { $gte: minPrice };
            }
          }
        }
        
        
        let sortOptions: any = { createdAt: -1 }; 
        
        switch (sortBy) {
          case 'oldest':
            sortOptions = { createdAt: 1 };
            break;
          case 'priceAsc':
            sortOptions = { price: 1 };
            break;
          case 'priceDesc':
            sortOptions = { price: -1 };
            break;
          case 'titleAsc':
            sortOptions = { title: 1 };
            break;
          case 'titleDesc':
            sortOptions = { title: -1 };
            break;
          
        }
        
        
        const total = await this._model.countDocuments(query);
        
        
        const courses = await this._model
          .find(query)
          .populate("category", "categoryName")
          .populate("instructor", "name")
          .sort(sortOptions)
          .skip(skip)
          .limit(limit)
          .exec();
        
        return { courses, total };
      } catch (error) {
        console.error("Error fetching published courses by instructor:", error);
        throw new Error("Could not fetch published courses");
      }
    }


    async findDraftsByInstructor(
  instructorId: string,
  page: number = 1,
  limit: number = 6,
  search: string = '',
  sortBy: string = 'newest',
  category: string = '',
  priceRange: string = '',
  language: string = ''
): Promise<{ courses: ICourse[]; total: number }> {
  try {
    const skip = (page - 1) * limit;

    const query: any = {
      instructor: instructorId,
      isPublished: false, // Changed to fetch draft courses
    };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
      ];
    }

    if (category) {
      query.category = category;
    }

    if (language) {
      query.language = language;
    }

    if (priceRange) {
      if (priceRange === 'free') {
        query.price = 0;
      } else {
        const [min, max] = priceRange.split('-').map(p => parseInt(p));
        if (max) {
          query.price = { $gte: min, $lte: max };
        } else if (priceRange.includes('+')) {
          const minPrice = parseInt(priceRange.replace('+', ''));
          query.price = { $gte: minPrice };
        }
      }
    }

    let sortOptions: any = { createdAt: -1 }; // Default: newest first

    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'priceAsc':
        sortOptions = { price: 1 };
        break;
      case 'priceDesc':
        sortOptions = { price: -1 };
        break;
      case 'titleAsc':
        sortOptions = { title: 1 };
        break;
      case 'titleDesc':
        sortOptions = { title: -1 };
        break;
    }

    const total = await this._model.countDocuments(query);

    const courses = await this._model
      .find(query)
      .populate("category", "categoryName")
      .populate("instructor", "name")
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .exec();

    return { courses, total };
  } catch (error) {
    console.error("Error fetching draft courses by instructor:", error);
    throw new Error("Could not fetch draft courses");
  }
}

      async findByIdWithPopulate(id: string): Promise<ICourse | null> {
        try {
          return await this._model.findById(id)
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
        } catch (error) {
          console.error("Error fetching course by ID with populate:", error);
          throw new Error("Could not fetch course with related data");
        }
      }

      async findAllPublishedCourses(
        page: number = 1, 
        limit: number = 6, 
        search: string = '', 
        sortBy: string = 'newest', 
        category: string = '', 
        priceRange: string = '', 
        language: string = ''
      ): Promise<{ courses: ICourse[]; total: number }> {
        try {
          const skip = (page - 1) * limit;
          
          
          const query: any = { isPublished: true, isBlocked: false };
          
          
          if (search) {
            query.$or = [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ];
          }
          
          
          if (category) {
            query.category = category;
          }
          
          
          if (language) {
            query.language = language;
          }
          
          
          if (priceRange) {
            if (priceRange === 'free') {
              query.price = 0;
            } else {
              const [min, max] = priceRange.split('-').map(val => parseInt(val));
              if (max) {
                query.price = { $gte: min, $lte: max };
              } else if (priceRange.includes('+')) {
                query.price = { $gte: min };
              }
            }
          }
          
          
          let sortOptions: any = { createdAt: -1 }; 
          
          switch (sortBy) {
            case 'oldest':
              sortOptions = { createdAt: 1 };
              break;
            case 'priceAsc':
              sortOptions = { price: 1 };
              break;
            case 'priceDesc':
              sortOptions = { price: -1 };
              break;
            case 'titleAsc':
              sortOptions = { title: 1 };
              break;
            case 'titleDesc':
              sortOptions = { title: -1 };
              break;
            default:
              sortOptions = { createdAt: -1 }; 
          }
      
          
          const total = await this._model.countDocuments(query);
      
          
          const courses = await this._model
            .find(query)
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .sort(sortOptions)
            .skip(skip)
            .limit(limit)
            .lean();
      
          return { courses, total };
        } catch (error) {
          console.error('Error in CourseRepository.findAllPublishedCourses:', error);
          throw new Error('Could not fetch published courses');
        }
      }

      async findStudentCourseById(courseId: string): Promise<ICourse | null> {
        try {
          const course = await this._model
            .findOne({ _id: courseId, isPublished: true, isBlocked: false })
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
    
          return course || null;
        } catch (error) {
          console.error('Error in CourseRepository.findStudentCourseById:', error);
          throw new Error('Could not fetch course');
        }
      }

      async findStudentEnrolledCourseById(courseId: string): Promise<ICourse | null> {
        try {
          const course = await this._model
            .findOne({ _id: courseId, isPublished: true, isBlocked: false })
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
    
          return course || null;
        } catch (error) {
          console.error('Error in CourseRepository.findStudentCourseById:', error);
          throw new Error('Could not fetch course');
        }
      }


      async update(courseId: string, updateData: any): Promise<ICourse | null> {
        try {
          const updatedCourse = await this._model
            .findByIdAndUpdate(
              courseId,
              { $set: updateData },
              { new: true, runValidators: true }
            )
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
      
          return updatedCourse || null;
        } catch (error) {
          console.error('Error in CourseRepository.update:', error);
          throw new Error('Could not update course');
        }
      }

    

      
async findEnrolledCourses(
  courseIds: Types.ObjectId[],
  page: number = 1,
  limit: number = 6,
  search: string = '',
  sortBy: string = 'newest',
  category: string = '',
  priceRange: string = '',
  language: string = ''
): Promise<{ courses: ICourse[]; total: number }> {
  try {
    const skip = (page - 1) * limit;
    
    
    const query: any = { 
      _id: { $in: courseIds },
      isBlocked: false 
    };
    
    
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }
    
    
    if (category) {
      query.category = category;
    }
    
   
    if (language) {
      query.language = language;
    }
    
    
    if (priceRange) {
      if (priceRange === 'free') {
        query.price = 0;
      } else {
        const [min, max] = priceRange.split('-').map(val => parseInt(val));
        if (max) {
          query.price = { $gte: min, $lte: max };
        } else if (priceRange.includes('+')) {
          query.price = { $gte: min };
        }
      }
    }
    
    
    let sortOptions: any = { createdAt: -1 }; 
    
    switch (sortBy) {
      case 'oldest':
        sortOptions = { createdAt: 1 };
        break;
      case 'priceAsc':
        sortOptions = { price: 1 };
        break;
      case 'priceDesc':
        sortOptions = { price: -1 };
        break;
      case 'titleAsc':
        sortOptions = { title: 1 };
        break;
      case 'titleDesc':
        sortOptions = { title: -1 };
        break;
      default:
        sortOptions = { createdAt: -1 }; 
    }

    
    const total = await this._model.countDocuments(query);

    
    const courses = await this._model
      .find(query)
      .populate('instructor', 'name')
      .populate('category', 'categoryName isActive')
      .sort(sortOptions)
      .skip(skip)
      .limit(limit)
      .lean();

    return { courses, total };
  } catch (error) {
    console.error('Error in CourseRepository.findEnrolledCourses:', error);
    throw new Error('Could not fetch enrolled courses');
  }
}



async getTotalCoursesByInstructor(instructorId: string): Promise<number> {
  try {
    return await this._model.countDocuments({ instructor: new mongoose.Types.ObjectId(instructorId) });
  } catch (error) {
    console.error('Error in CourseRepository.getTotalCoursesByInstructor:', error);
    throw new Error('Could not fetch total courses');
  }
}


async getPublishedCoursesByInstructor(instructorId: string): Promise<number> {
  try {
    return await this._model.countDocuments({
      instructor: new mongoose.Types.ObjectId(instructorId),
      isPublished: true,
      isBlocked: false,
    });
  } catch (error) {
    console.error('Error in CourseRepository.getPublishedCoursesByInstructor:', error);
    throw new Error('Could not fetch published courses');
  }
}


async getCourseCreationTimeline(instructorId: string): Promise<{ _id: string; count: number }[]> {
  try {
    const twelveMonthsAgo = new Date();
    twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

    return await this._model.aggregate([
      {
        $match: {
          instructor: new mongoose.Types.ObjectId(instructorId),
          createdAt: { $gte: twelveMonthsAgo },
        },
      },
      {
        $group: {
          _id: { $dateToString: { format: '%Y-%m', date: '$createdAt' } },
          count: { $sum: 1 },
        },
      },
      { $sort: { '_id': 1 } },
    ]);
  } catch (error) {
    console.error('Error in CourseRepository.getCourseCreationTimeline:', error);
    throw new Error('Could not fetch course creation timeline');
  }
}


async getCourseIdsByInstructor(instructorId: string): Promise<string[]> {
  try {
    const courses = await this._model
      .find({ instructor: new mongoose.Types.ObjectId(instructorId) })
      .select('_id')
      .lean();
    return courses.map((course) => course._id.toString());
  } catch (error) {
    console.error('Error in CourseRepository.getCourseIdsByInstructor:', error);
    throw new Error('Could not fetch course IDs');
  }
}


async getCourseDistributionByCategory(): Promise<{ categoryName: string; count: number }[]> {
  try {
    return await this._model.aggregate([
      {
        $lookup: {
          from: 'categories', 
          localField: 'category',
          foreignField: '_id',
          as: 'categoryDetails',
        },
      },
      {
        $unwind: '$categoryDetails',
      },
      {
        $group: {
          _id: '$categoryDetails.categoryName',
          count: { $sum: 1 },
        },
      },
      {
        $project: {
          _id: 0,
          categoryName: '$_id',
          count: 1,
        },
      },
    ]);
  } catch (error) {
    console.error('Error in CourseRepository.getCourseDistributionByCategory:', error);
    throw new Error('Could not fetch course distribution');
  }
}

async getTotalCourses(): Promise<number> {
  try {
    return await this._model.countDocuments();
  } catch (error) {
    console.error('Error in CourseRepository.getTotalCourses:', error);
    throw new Error('Could not fetch total courses');
  }
}

async getTopCoursesByEnrollment(limit: number = 5): Promise<
    { courseName: string; instructorName: string; categoryName: string; enrollmentCount: number }[]
  > {
    try {
      const topCourses = await this._model.aggregate([
       
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        
        {
          $lookup: {
            from: 'users',
            localField: 'instructor',
            foreignField: '_id',
            as: 'instructorDetails',
          },
        },
        {
          $unwind: '$instructorDetails',
        },
        
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $unwind: '$categoryDetails',
        },
        
        {
          $project: {
            courseName: '$title',
            instructorName: '$instructorDetails.name',
            categoryName: '$categoryDetails.categoryName',
            enrollmentCount: { $size: '$enrollments' },
          },
        },
       
        {
          $sort: { enrollmentCount: -1 },
        },
        
        {
          $limit: limit,
        },
      ]);
      return topCourses;
    } catch (error) {
      console.error('Error in CourseRepository.getTopCoursesByEnrollment:', error);
      throw new Error('Could not fetch top courses by enrollment');
    }
  }




async findByInstructor(instructorId: string): Promise<ICourse[]> {
  try {
    const courses = await this._model
      .find({ instructor: instructorId, isPublished: true })
      .select('_id title');
    
    return courses;
  } catch (error) {
    console.error("Error fetching instructor courses:", error);
    throw new Error("Could not fetch instructor courses");
  }
}

}

export default CourseRepository;