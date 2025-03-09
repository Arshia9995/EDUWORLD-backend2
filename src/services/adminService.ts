import { AdminDoc } from "../interfaces/IAdmin";
import AdminRepository from "../repositories/adminRepository";
import bcrypt from "bcryptjs";
import { IAdminService } from "../interfaces/IServices";
import UserRepository from "../repositories/userRepository";
import dotenv from "dotenv";

dotenv.config();




export class AdminServices implements IAdminService {
    constructor(
        private _userRepository: UserRepository,
        private _adminRepository: AdminRepository
    ){
        this._userRepository = _userRepository;
        this._adminRepository = _adminRepository;
    }

    async adminLogin(email: string, password:string) {
        let admin = await this._adminRepository.findByQuery({ email });

        if(!admin) {
            if(email === process.env.ADMIN_EMAIL && password === process.env.ADMIN_PASSWORD) {
                admin =await this._adminRepository.create({
                    email,
                    password: await bcrypt.hash(password, 10),
                } as AdminDoc);
                return { success: true, message: "Admin account created and logged in successfully",
                    data: {
                        _id: admin._id,
                        email: admin.email,
                        role: 'admin'
                    
                    }
                };
            } else {
                return { success: false, message: "Invalid credentials", data: null };
            }
        }

        const isPasswordValid = await bcrypt.compare(password, admin.password);
        if (!isPasswordValid) {
            return { success: false, message: "Invalid credentials", data: null };
          }

          return { success: true, message: "Login successful",
            data: {
                _id: admin._id,
                email: admin.email,
                role: 'admin'
            }
           };

    }

    async getAllStudents() {
        try {
            const students = await this._userRepository.findAll({ role: "student"});
            if (students.length === 0) {
                return { success: false, message: "No students found" };
            }
            return { success: true, message: "Students retrieved successfully", data: students };
        } catch (error) {
            console.error("Error fetching students:", error);
            return { success: false, message: "Internal server error" };
            
        }
    }

    async blockUser(userId: string) {
        try {
            const user = await this._userRepository.findById(userId);
            if(!user) {
                return { success: false, message: "User not found" };
            }

            if(user.isBlocked) {
                return { success: false, message: "User is already blocked" }; 
            }

            const updatedUser = await this._userRepository.update(userId, {isBlocked: true});
            if(!updatedUser) {
                return { success: false, message: "Failed to block user" };
            }

            return { 
                success: true, 
                message: "User blocked successfully", 
                data: updatedUser 
              };
        } catch (error) {
            console.error("Error blocking user:", error);
      return { success: false, message: "Internal server error" };
            
        }
    }

    async unblockUser(userId: string) {
        try {
            const user = await this._userRepository.findById(userId);
            if (!user) {
                return { success: false, message: "User not found" };
              }

              if (!user.isBlocked) {
                return { success: false, message: "User is not blocked" };
              }

            const updatedUser = await this._userRepository.update(userId, {isBlocked: false});
            if (!updatedUser) {
                return { success: false, message: "Failed to unblock user" };
              }

              return { 
                success: true, 
                message: "User unblocked successfully", 
                data: updatedUser 
              }; 
        } catch (error) {
            console.error("Error unblocking user:", error);
      return { success: false, message: "Internal server error" };
        }
    }

    async getAllInstructors() {
        try {
            const instructors = await this._userRepository.findAll({ role: "instructor"});
            if (instructors.length === 0) {
                return { success: false, message: "No instructors found" };
            }
            return { success: true, message: "Instructors retrieved successfully", data: instructors };
        } catch (error) {
            console.error("Error fetching instructors:", error);
            return { success: false, message: "Internal server error" };
            
        }
    }

    async approveInstructor(instructorId: string) {
        try {
          const instructor = await this._userRepository.findById(instructorId);
          if (!instructor || instructor.role !== "instructor") {
            return { success: false, message: "Instructor not found" };
          }
          instructor.isApproved = true;
          instructor.isRequested = false;
          instructor.isRejected = false;
          const updatedInstructor = await instructor.save();
          const instructors = await this._userRepository.findAll({ role: "instructor"});

          return { success: true, message: "Instructor approved", data: instructors };
        } catch (error) {
          console.error("Error approving instructor:", error);
          return { success: false, message: "Internal server error" };
        }
      }

      async rejectInstructor(instructorId: string) {
        try {
          const instructor = await this._userRepository.findById(instructorId);
          if (!instructor || instructor.role !== "instructor") {
            return { success: false, message: "Instructor not found" };
          }
          instructor.isApproved = false;
          instructor.isRequested = false;
          instructor.isRejected = true;
          const updatedInstructor = await instructor.save();

          const instructors = await this._userRepository.findAll({ role: "instructor"});

          return { success: true, message: "Instructor rejected", data: instructors };
        } catch (error) {
          console.error("Error rejecting instructor:", error);
          return { success: false, message: "Internal server error" };
        }
      }

      async blockInstructor(instructorId: string) {
        try {
          const instructor = await this._userRepository.findById(instructorId);
          if (!instructor) {
            return { success: false, message: "Instructor not found" };
          }
    
          if (instructor.isBlocked) {
            return { success: false, message: "Instructor is already blocked" };
          }
    
          const updatedInstructor = await this._userRepository.update(instructorId, { isBlocked: true });
          if (!updatedInstructor) {
            return { success: false, message: "Failed to block instructor" };
          }
    
          return {
            success: true,
            message: "Instructor blocked successfully",
            data: updatedInstructor,
          };
        } catch (error) {
          console.error("Error blocking instructor:", error);
          return { success: false, message: "Internal server error" };
        }
      }
    
      async unblockInstructor(instructorId: string) {
        try {
          const instructor = await this._userRepository.findById(instructorId);
          if (!instructor) {
            return { success: false, message: "Instructor not found" };
          }
    
          if (!instructor.isBlocked) {
            return { success: false, message: "Instructor is not blocked" };
          }
    
          const updatedInstructor = await this._userRepository.update(instructorId, { isBlocked: false });
          if (!updatedInstructor) {
            return { success: false, message: "Failed to unblock instructor" };
          }
    
          return {
            success: true,
            message: "Instructor unblocked successfully",
            data: updatedInstructor,
          };
        } catch (error) {
          console.error("Error unblocking instructor:", error);
          return { success: false, message: "Internal server error" };
        }
      }


}
