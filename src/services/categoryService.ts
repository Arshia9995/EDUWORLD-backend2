import { CategoryDoc } from "../interfaces/ICategory";
import CategoryRepository from "../repositories/categoryRepository";
import { ICategoryService } from "../interfaces/IServices";




export class CategoryServices implements ICategoryService {
    constructor (
        private _categoryRepository: CategoryRepository
    ){
        this._categoryRepository = _categoryRepository;
    }


    async addCategory(categoryName: string) {
        try {
          if (!categoryName.trim()) {
            return { success: false, message: "Category name cannot be empty", data: null };
          }
    
         
          const existingCategories = await this._categoryRepository.findAll({});
          if (existingCategories.some((cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase())) {
            return { success: false, message: "Category already exists", data: null };
          }
    
          const category = await this._categoryRepository.create({ categoryName });
          return {
            success: true,
            message: "Category added successfully",
            data: category,
          };
        } catch (error) {
          console.error("Error adding category:", error);
          return { success: false, message: "Internal server error", data: null };
        }
      }

      async getAllCategories() {
        try {
          const categories = await this._categoryRepository.findAll({});
          if (categories.length === 0) {
            return { success: false, message: "No categories found", data: null };
          }
          return {
            success: true,
            message: "Categories retrieved successfully",
            data: categories,
          };
        } catch (error) {
          console.error("Error fetching categories:", error);
          return { success: false, message: "Internal server error", data: null };
        }
      }

      async updateCategory(id: string, categoryName: string) {
        try {
          if (!categoryName.trim()) {
            return { success: false, message: "Category name cannot be empty", data: null };
          }
    
          const existingCategories = await this._categoryRepository.findAll({});
          if (
            existingCategories.some(
              (cat) => cat.categoryName.toLowerCase() === categoryName.toLowerCase() && cat._id.toString() !== id
            )
          ) {
            return { success: false, message: "Category name already exists", data: null };
          }
    
          const updatedCategory = await this._categoryRepository.update(id, { categoryName });
          if (!updatedCategory) {
            return { success: false, message: "Category not found", data: null };
          }
    
          return {
            success: true,
            message: "Category updated successfully",
            data: updatedCategory,
          };
        } catch (error) {
          console.error("Error updating category:", error);
          return { success: false, message: "Internal server error", data: null };
        }
      }

      async blockCategory(id: string) {
        try {
          const category = await this._categoryRepository.findById(id);
          if (!category) {
            return { success: false, message: "Category not found", data: null };
          }
          if (!category.isActive) {
            return { success: false, message: "Category is already blocked", data: null };
          }
    
          const updatedCategory = await this._categoryRepository.update(id, { isActive: false });
          return {
            success: true,
            message: "Category blocked successfully",
            data: updatedCategory,
          };
        } catch (error) {
          console.error("Error blocking category:", error);
          return { success: false, message: "Internal server error", data: null };
        }
      }
    
      async unblockCategory(id: string){
        try {
          const category = await this._categoryRepository.findById(id);
          if (!category) {
            return { success: false, message: "Category not found", data: null };
          }
          if (category.isActive) {
            return { success: false, message: "Category is already active", data: null };
          }
    
          const updatedCategory = await this._categoryRepository.update(id, { isActive: true });
          return {
            success: true,
            message: "Category unblocked successfully",
            data: updatedCategory,
          };
        } catch (error) {
          console.error("Error unblocking category:", error);
          return { success: false, message: "Internal server error", data: null };
        }
      }

      async fetchAllCategories() {
        try {
          const categories = await this._categoryRepository.findAll({ isActive: true });
          if (categories.length === 0) {
            return { success: false, message: 'No active categories found', data: null };
          }
          return {
            success: true,
            message: 'Active categories retrieved successfully',
            data: categories,
          };
        } catch (error) {
          console.error('Error fetching categories:', error);
          return { success: false, message: 'Internal server error', data: null };
        }
      }




}