export interface ICourseStats {
    _id: string;
    title: string;
    enrolledStudents: number;
    price: number;
    instructorName: string | null;
    categoryName: string;
    status: string;
  }