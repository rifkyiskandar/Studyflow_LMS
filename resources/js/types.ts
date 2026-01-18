export interface Faculty {
  faculty_id: number;
  faculty_name: string;
  created_at?: string;
  updated_at?: string;
}

export interface Major {
  major_id: number;
  major_name: string;
  faculty_id: number;
  created_at?: string;
  updated_at?: string;

  faculty?: Faculty;
}

export interface NavItem {
    id?: string;
    label: string;
    icon: string;
    active?: boolean;
    children?: NavItem[];
}

export interface Room {
  room_id: number;
  room_name: string;
  building: string;
  floor: string;
  capacity: number;
}

export interface Course {
  course_id: number;
  course_code: string;
  course_name: string;
  sks: number;
  description?: string;

  faculty_id: number;
  major_id: number;

  faculty?: Faculty;
  major?: Major;
}

export interface Semester {
  semester_id: number;
  semester_name: string;
  academic_year: string;
  term: 'Ganjil' | 'Genap' | 'Pendek';
  start_date: string;
  end_date: string;
  is_active: boolean;
}

export interface StudentProfile {
    student_number: string;
    faculty_id: number;
    major_id: number;
    semester_id: number;
    batch_year: number;
    major?: Major;
}

export interface LecturerProfile {
    lecturer_number: string;
    faculty_id: number;
    title: string;
    position: string;
    faculty?: Faculty;
}

export interface User {
    user_id: number;
    full_name: string;
    email: string;
    role_id: number;
    phone_number: string | null;
    birth_date: string | null;
    profile_picture: string | null;
    student_profile?: StudentProfile;
    lecturer_profile?: LecturerProfile;
}

export interface CourseClass {
  class_id: number;
  class_name?: string;

  course_id: number;
  semester_id: number;
  room_id: number;
  lecturer_id: number;

  day: string;
  start_time: string;
  end_time: string;

  course?: Course;
  semester?: Semester;
  room?: Room;
  lecturer?: User;
}

export interface Curriculum {
  curriculum_id: number;
  major_id: number;
  course_id: number;
  semester: number;
  category: 'MKU' | 'WAJIB_PRODI' | 'WAJIB_FAKULTAS' | 'PILIHAN';
  academic_year: number;

  major?: Major;
  course?: Course;
}

export interface CostComponent {
  cost_component_id: number;
  component_name: string;
  component_code: string;
  billing_type: 'PER_SKS' | 'PER_COURSE' | 'PER_SEMESTER' | 'ONE_TIME';
  amount: number;
  created_at?: string;
  updated_at?: string;
}

export interface Billing {
  billing_id: number;
  description: string;
  amount: number;
  due_date: string;
  status: 'unpaid' | 'paid' | 'overdue';
  cost_component?: { component_name: string };
  semester?: { semester_name: string };
}

export interface KrsItem {
  krs_item_id: number;
  krs_id: number;
  class_id: number;
  sks: number;
  status: 'pending' | 'approved' | 'rejected' | 'draft';

  class?: CourseClass;
}

export interface KrsRequest {
  krs_id: number;
  student_id: number;
  semester_id: number;
  status: 'draft' | 'submitted' | 'approved' | 'rejected';
  total_sks: number;

  items: KrsItem[];
}

export interface AvailableClassItem {
  id: number;
  courseCode: string;
  courseName: string;
  className: string;
  category: string;
  sks: number;
  lecturer: string;
  day: string;
  start_time: string;
  end_time: string;
  room: string;
  quota: number;
  enrolled: number;
  isFull: boolean;
  isTaken: boolean;
}

export interface StudentKrsPageProps {
  auth: {
      user: User;
  };
  krs: KrsRequest;
  availableClasses: AvailableClassItem[];
  maxSks: number;
  flash: {
      success?: string;
      error?: string;
  };
}

export interface PageProps {
  auth: { user: User };
  flash: { success?: string; error?: string };
  env: {
      midtrans_client_key: string;
  };
}

declare global {
    interface Window {
        snap: any;
    }
}
