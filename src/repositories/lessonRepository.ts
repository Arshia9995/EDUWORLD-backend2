import { ILesson } from "../interfaces/ILesson";
import { lessonModel } from "../models/lessonModel";
import { BaseRepository } from "./baseRepository";

class LessonRepository extends BaseRepository<ILesson>{
    constructor() {
        super(lessonModel)
    }
}

export default LessonRepository;