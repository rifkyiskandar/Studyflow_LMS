<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\Course;
use App\Models\Semester;
use App\Models\Room;
use App\Models\User;
use Illuminate\Http\Request;
use Inertia\Inertia;

class CourseClassController extends Controller
{
    public function index(Request $request)
    {
        $classes = CourseClass::with(['course', 'semester', 'room', 'lecturer'])
            ->when($request->input('search'), function ($query, $search) {
                $query->whereHas('course', function ($q) use ($search) {
                    $q->where('course_name', 'like', "%{$search}%");
                })->orWhereHas('lecturer', function ($q) use ($search) {
                    $q->where('full_name', 'like', "%{$search}%");
                });
            })
            ->when($request->input('semester_id'), function ($query, $id) {
                $query->where('semester_id', $id);
            })
            ->when($request->input('course_id'), function ($query, $id) {
                $query->where('course_id', $id);
            })
            ->orderBy('day')
            ->orderBy('start_time')
            ->paginate(10)
            ->withQueryString();


        $courses = Course::select('course_id', 'course_name', 'course_code')->get();
        $lecturers = User::where('role_id', 2)->select('user_id', 'full_name')->get();
        $rooms = Room::select('room_id', 'room_name', 'building')->get();
        $semesters = Semester::select('semester_id', 'semester_name', 'is_active')->orderBy('is_active', 'desc')->get();

        return Inertia::render('Admin/Classes/Index', [
            'classes' => $classes,
            'courses' => $courses,
            'lecturers' => $lecturers,
            'rooms' => $rooms,
            'semesters' => $semesters,
            'filters' => $request->only(['search', 'semester_id', 'course_id']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'course_id'   => 'required|exists:courses,course_id',
            'lecturer_id' => 'required|exists:users,user_id',
            'semester_id' => 'required|exists:semesters,semester_id',
            'room_id'     => 'required|exists:rooms,room_id',
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',

            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'class_name'  => 'nullable|string|max:50',
        ]);


        CourseClass::create($request->all());

        return to_route('admin.classes.index')
            ->with('success', 'Class schedule created successfully.');
    }

    public function update(Request $request, CourseClass $class)
    {

        $courseClass = $class;

        $request->validate([
            'course_id'   => 'required|exists:courses,course_id',
            'lecturer_id' => 'required|exists:users,user_id',
            'semester_id' => 'required|exists:semesters,semester_id',
            'room_id'     => 'required|exists:rooms,room_id',
            'day'         => 'required|in:Monday,Tuesday,Wednesday,Thursday,Friday,Saturday,Sunday',
            'start_time'  => 'required|date_format:H:i',
            'end_time'    => 'required|date_format:H:i|after:start_time',
            'class_name'  => 'nullable|string|max:50',
        ]);

        $courseClass->update($request->all());

        return to_route('admin.classes.index')
            ->with('success', 'Class schedule updated successfully.');
    }

    public function destroy($id)
    {
        CourseClass::destroy($id);
        return to_route('admin.classes.index')
            ->with('success', 'Class schedule deleted successfully.');
    }
}
