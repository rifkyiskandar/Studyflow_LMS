<?php

namespace Database\Seeders;

use App\Models\User;
use App\Models\Faculty;
use App\Models\Major;
use App\Models\Semester;
use App\Models\Room;
use App\Models\Course;
use App\Models\CourseClass;
use App\Models\Grade;
use App\Models\Curriculum;
use App\Models\CostComponent;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class DatabaseSeeder extends Seeder
{
    public function run(): void
    {


        $sem3 = Semester::create([
            'semester_name' => 'Ganjil 2025/2026', 'academic_year' => '2025/2026', 'term' => 'Ganjil',
            'start_date' => '2025-09-01', 'end_date' => '2026-01-31', 'is_active' => true,
        ]);


        $sem2 = Semester::create([
            'semester_name' => 'Genap 2024/2025', 'academic_year' => '2024/2025', 'term' => 'Genap',
            'start_date' => '2025-02-01', 'end_date' => '2025-06-30', 'is_active' => false,
        ]);


        $sem1 = Semester::create([
            'semester_name' => 'Ganjil 2024/2025', 'academic_year' => '2024/2025', 'term' => 'Ganjil',
            'start_date' => '2024-09-01', 'end_date' => '2025-01-31', 'is_active' => false,
        ]);


        CostComponent::create(['component_code' => 'SKS', 'component_name' => 'Biaya per SKS', 'billing_type' => 'PER_SKS', 'amount' => 250000]);
        CostComponent::create(['component_code' => 'BPP', 'component_name' => 'Biaya Tetap Semester', 'billing_type' => 'PER_SEMESTER', 'amount' => 4000000]);



        $faculty = Faculty::create(['faculty_name' => 'Faculty of Computer Science']);
        $major = Major::create(['major_name' => 'Informatics', 'faculty_id' => $faculty->faculty_id]);
        $room = Room::create(['room_name' => 'LAB-A', 'building' => 'Gedung TI', 'floor' => '2', 'capacity' => 40]);



        User::create([
            'full_name' => 'Super Admin', 'email' => 'admin@lms.com', 'password_hash' => Hash::make('password'), 'role_id' => 1
        ]);


        $lecturer = User::create([
            'full_name' => 'Dr. Alan Turing', 'email' => 'dosen@lms.com', 'password_hash' => Hash::make('password'), 'role_id' => 2
        ]);
        $lecturer->lecturerProfile()->create(['lecturer_number' => 'D001', 'faculty_id' => $faculty->faculty_id, 'title' => 'Dr.', 'position' => 'Lecturer']);


        $student = User::create([
            'full_name' => 'John Doe', 'email' => 'student@lms.com', 'password_hash' => Hash::make('password'), 'role_id' => 3
        ]);
        $student->studentProfile()->create([
            'student_number' => '2024001',
            'faculty_id' => $faculty->faculty_id,
            'major_id' => $major->major_id,
            'semester_id' => $sem1->semester_id,
            'batch_year' => 2024,
            'gpa' => 2.00,
        ]);
        $student->profileInfo()->create(['nickname' => 'John', 'dream_job' => 'Software Engineer']);







        $cKalkulus = Course::create(['course_code' => 'MAT101', 'course_name' => 'Kalkulus I', 'sks' => 4, 'faculty_id' => $faculty->faculty_id, 'major_id' => $major->major_id]);
        Curriculum::create(['major_id' => $major->major_id, 'course_id' => $cKalkulus->course_id, 'semester' => 1, 'category' => 'WAJIB_FAKULTAS']);




        $cAlgo = Course::create(['course_code' => 'CS101', 'course_name' => 'Algoritma & Pemrograman', 'sks' => 4, 'faculty_id' => $faculty->faculty_id, 'major_id' => $major->major_id]);
        Curriculum::create(['major_id' => $major->major_id, 'course_id' => $cAlgo->course_id, 'semester' => 1, 'category' => 'WAJIB_PRODI']);






        $cPancasila = Course::create(['course_code' => 'MKU001', 'course_name' => 'Pancasila', 'sks' => 2, 'faculty_id' => $faculty->faculty_id, 'major_id' => $major->major_id]);
        Curriculum::create(['major_id' => $major->major_id, 'course_id' => $cPancasila->course_id, 'semester' => 2, 'category' => 'MKU']);






        $cAI = Course::create(['course_code' => 'CS301', 'course_name' => 'Artificial Intelligence', 'sks' => 3, 'faculty_id' => $faculty->faculty_id, 'major_id' => $major->major_id]);
        Curriculum::create(['major_id' => $major->major_id, 'course_id' => $cAI->course_id, 'semester' => 3, 'category' => 'WAJIB_PRODI']);






        CourseClass::create([
            'course_id' => $cAI->course_id, 'lecturer_id' => $lecturer->user_id, 'semester_id' => $sem3->semester_id, 'room_id' => $room->room_id,
            'class_name' => 'A', 'day' => 'Monday', 'start_time' => '08:00:00', 'end_time' => '10:30:00'
        ]);



        CourseClass::create([
            'course_id' => $cKalkulus->course_id, 'lecturer_id' => $lecturer->user_id, 'semester_id' => $sem3->semester_id, 'room_id' => $room->room_id,
            'class_name' => 'Remedial', 'day' => 'Tuesday', 'start_time' => '13:00:00', 'end_time' => '16:00:00'
        ]);


        CourseClass::create([
            'course_id' => $cAlgo->course_id, 'lecturer_id' => $lecturer->user_id, 'semester_id' => $sem3->semester_id, 'room_id' => $room->room_id,
            'class_name' => 'Reguler', 'day' => 'Wednesday', 'start_time' => '08:00:00', 'end_time' => '11:00:00'
        ]);


    }
}
