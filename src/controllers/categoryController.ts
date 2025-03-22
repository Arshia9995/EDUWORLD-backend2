import { Request, Response } from "express";
import { Status } from "../utils/enums";
import { CategoryServices } from "../services/categoryService";



class CategoryController {
    constructor(private _categoryService: CategoryServices) {
        this._categoryService = _categoryService
    }

    async addCategory(req: Request, res: Response) {
        try {
          const { categoryName } = req.body;
          const result = await this._categoryService.addCategory(categoryName);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.CREATED).json({
            message: result.message,
            category: result.data,
          });
        } catch (error: any) {
          console.error("Error in addCategory controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }

      async getAllCategories(req: Request, res: Response) {
        try {
          const result = await this._categoryService.getAllCategories();
    
          if (!result.success) {
            return res.status(Status.NOT_FOUND).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            message: result.message,
            categories: result.data,
          });
        } catch (error: any) {
          console.error("Error in getAllCategories controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }

      async updateCategory(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const { categoryName } = req.body;
          const result = await this._categoryService.updateCategory(id, categoryName);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            message: result.message,
            category: result.data,
          });
        } catch (error: any) {
          console.error("Error in updateCategory controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }

      async blockCategory(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const result = await this._categoryService.blockCategory(id);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            message: result.message,
            category: result.data,
          });
        } catch (error: any) {
          console.error("Error in blockCategory controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }
    
      async unblockCategory(req: Request, res: Response) {
        try {
          const { id } = req.params;
          const result = await this._categoryService.unblockCategory(id);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.OK).json({
            message: result.message,
            category: result.data,
          });
        } catch (error: any) {
          console.error("Error in unblockCategory controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }

      async fetchAllCategories(req: Request, res: Response) {
        try {
          const result = await this._categoryService.fetchAllCategories();
    
          if (!result.success) {
            return res.status(Status.NOT_FOUND).json({ message: result.message });
          }
    
          return res.status(Status.OK).json(result.data); // Return categories directly
        } catch (error: any) {
          console.error('Error in getAllCategories controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
          });
        }
      }





}

export default CategoryController