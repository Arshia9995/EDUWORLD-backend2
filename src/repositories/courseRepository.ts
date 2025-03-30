import { ICourse } from "../interfaces/ICourse";
import { courseModel } from "../models/courseModel";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository<ICourse>{
    constructor() {
        super(courseModel)
        
    }

    // async findcourseName(instructorId: string) {
    //   try {
    //     return await this._model.find({instructorId},{title:'tfyhyy'}).countDocuments()
    //   } catch (error) {
        
    //   }
    // }

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
        
        // Build query object
        const query: any = {
          instructor: instructorId,
          isPublished: true
        };
        
        // Add search condition if provided
        if (search) {
          query.$or = [
            { title: { $regex: search, $options: 'i' } },
            { description: { $regex: search, $options: 'i' } }
          ];
        }
        
        // Add category filter if provided
        if (category) {
          query.category = category;
        }
        
        // Add language filter if provided
        if (language) {
          query.language = language;
        }
        
        // Add price range filter if provided
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
        
        // Determine the sort order
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
          // Default is already set (newest)
        }
        
        // Get total count with filters
        const total = await this._model.countDocuments(query);
        
        // Get paginated courses with filters and sort
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
          
          // Build query filters
          const query: any = { isPublished: true, isBlocked: false };
          
          // Search filter (title and description)
          if (search) {
            query.$or = [
              { title: { $regex: search, $options: 'i' } },
              { description: { $regex: search, $options: 'i' } }
            ];
          }
          
          // Category filter
          if (category) {
            query.category = category;
          }
          
          // Language filter
          if (language) {
            query.language = language;
          }
          
          // Price range filter
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
          
          // Build sort options
          let sortOptions: any = { createdAt: -1 }; // default: newest first
          
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
              sortOptions = { createdAt: -1 }; // newest first
          }
      
          // Get total count with filters applied
          const total = await this._model.countDocuments(query);
      
          // Get paginated courses with filters and sorting
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

}

export default CourseRepository;