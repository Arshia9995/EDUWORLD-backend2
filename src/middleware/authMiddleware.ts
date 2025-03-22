import { Request, Response, NextFunction } from "express";
import jwt, { JwtPayload } from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

const secret = process.env.JWT_SECRET!;

export interface AuthRequest extends Request {
    user?: {
        id: string;
        role: string;
        email: string;
    };
}

export const authenticateUser = (requiredRole?: string) => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            let token = req.cookies.token; // Matches your verifyUser cookie name

            if (!token) {
                console.log("No token found");
                res.status(401).json({ message: "Unauthorized: No token provided" });
                return;
            }

            const decoded = jwt.verify(token, secret) as JwtPayload;
            console.log("Decoded Token:", decoded);

            if (typeof decoded === "string" || !decoded.payload) {
                res.status(401).json({ message: "Unauthorized: Invalid token" });
                return;
            }

            req.user = decoded.payload as { id: string; role: string; email: string };
            console.log("User in Request:", req.user);

            if (requiredRole && req.user.role !== requiredRole) {
                res.status(403).json({ message: "Forbidden: Insufficient permissions" });
                return;
            }

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            res.status(401).json({ message: "Unauthorized: Invalid or expired token" });
        }
    };
};

export const authenticateAdmin = () => {
    return (req: AuthRequest, res: Response, next: NextFunction): void => {
        try {
            let token = req.cookies.admintoken; // Matches your adminLogin cookie name

            if (!token) {
                console.log("No admin token found");
                res.status(401).json({ message: "Unauthorized: No admin token provided" });
                return;
            }

            const decoded = jwt.verify(token, secret) as JwtPayload;
            console.log("Decoded Token:", decoded);

            if (typeof decoded === "string" || !decoded.payload) {
                res.status(401).json({ message: "Unauthorized: Invalid admin token" });
                return;
            }

            req.user = decoded.payload as { id: string; role: string; email: string };
            console.log("Admin in Request:", req.user);

            if (req.user.role !== "admin") {
                res.status(403).json({ message: "Forbidden: Admin access required" });
                return;
            }

            next();
        } catch (error) {
            console.error("JWT Verification Error:", error);
            res.status(401).json({ message: "Unauthorized: Invalid or expired admin token" });
        }
    };
};