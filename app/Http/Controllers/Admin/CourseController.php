<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Course;
use App\Models\Faculty;
use App\Models\Major;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;
use Illuminate\Support\Str;

class CourseController extends Controller
{
    public function index(Request $request)
    {
        $courses = Course::with(['faculty', 'major'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('course_name', 'like', "%{$search}%")
                      ->orWhere('course_code', 'like', "%{$search}%");
                });
            })
            ->when($request->input('faculty_id'), function ($query, $id) {
                $query->where('faculty_id', $id);
            })
            ->when($request->input('major_id'), function ($query, $id) {
                $query->where('major_id', $id);
            })
            ->paginate(10)
            ->withQueryString();

        $faculties = Faculty::select('faculty_id', 'faculty_name')->orderBy('faculty_name')->get();
        $majors = Major::select('major_id', 'major_name', 'faculty_id')->orderBy('major_name')->get();

        return Inertia::render('Admin/Courses/Index', [
            'courses' => $courses,
            'faculties' => $faculties,
            'majors' => $majors,
            'filters' => $request->only(['search', 'faculty_id', 'major_id']),
        ]);
    }

    public function store(Request $request)
    {

        $request->validate([
            'course_name' => 'required|string|max:255',
            'sks'         => 'required|integer|min:1|max:6',
            'faculty_id'  => 'required|exists:faculties,faculty_id',
            'major_id'    => 'required|exists:majors,major_id',
            'description' => 'nullable|string',
        ]);




        $major = Major::findOrFail($request->major_id);


        $prefix = strtoupper(substr($major->major_name, 0, 3));


        do {
            $number = rand(100, 999);
            $generatedCode = $prefix . '-' . $number;
        } while (Course::where('course_code', $generatedCode)->exists());


        Course::create([
            'course_code' => $generatedCode,
            'course_name' => $request->course_name,
            'sks'         => $request->sks,
            'faculty_id'  => $request->faculty_id,
            'major_id'    => $request->major_id,
            'description' => $request->description,
        ]);

        return to_route('admin.courses.index')->with('success', 'Course created successfully with code: ' . $generatedCode);
    }

    public function update(Request $request, Course $course)
    {

        $request->validate([
            'course_code' => [
                'required', 'string', 'max:20',
                Rule::unique('courses')->ignore($course->course_id, 'course_id')
            ],
            'course_name' => 'required|string|max:255',
            'sks'         => 'required|integer|min:1|max:6',
            'faculty_id'  => 'required|exists:faculties,faculty_id',
            'major_id'    => 'required|exists:majors,major_id',
            'description' => 'nullable|string',
        ]);

        $course->update($request->all());

        return to_route('admin.courses.index')->with('success', 'Course updated successfully.');
    }

    public function destroy(Course $course)
    {
        $course->delete();
        return to_route('admin.courses.index')->with('success', 'Course deleted successfully.');
    }
}
