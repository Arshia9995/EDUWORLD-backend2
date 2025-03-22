import { ICourse } from "../interfaces/ICourse";
import { courseModel } from "../models/courseModel";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository<ICourse>{
    constructor() {
        super(courseModel)
    }
}

export default CourseRepository;