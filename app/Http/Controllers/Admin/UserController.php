<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Faculty;
use App\Models\Major;
use App\Models\Semester;
use App\Models\StudentProfile;
use App\Models\LecturerProfile;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;
use Illuminate\Validation\Rules;

class UserController extends Controller
{
    public function index(Request $request)
    {

        $filters = $request->only('search', 'role');
        $roleId = $request->input('role', 3);

        $users = User::query()
            ->where('role_id', $roleId)
            ->with(['studentProfile.major', 'lecturerProfile.faculty'])
            ->when($request->input('search'), function ($query, $search) {
                $query->where('full_name', 'like', "%{$search}%")
                    ->orWhere('email', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Users/Index', [
            'users' => $users,
            'filters' => $filters,
            'faculties' => Faculty::all(['faculty_id', 'faculty_name']),
            'majors' => Major::all(['major_id', 'major_name', 'faculty_id']),
            'semesters' => Semester::all(['semester_id', 'semester_name', 'academic_year', 'term']),
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'confirmed', Rules\Password::defaults()],
            'role_id' => 'required|integer|in:1,2,3',
            'phone_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',

            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);


        $profilePicturePath = null;
        if ($request->hasFile('profile_picture')) {

            $path = $request->file('profile_picture')->store('profile_pictures', 'public');

            $profilePicturePath = '/storage/' . $path;
        }

        $user = User::create([
            'full_name' => $request->full_name,
            'email' => $request->email,
            'password_hash' => Hash::make($request->password),
            'role_id' => $request->role_id,
            'phone_number' => $request->phone_number,
            'birth_date' => $request->birth_date,
            'is_active' => true,
            'profile_picture' => $profilePicturePath,
        ]);


        if ($request->role_id == 3) {
             $request->validate([
                'faculty_id' => 'required|exists:faculties,faculty_id',
                'major_id' => 'required|exists:majors,major_id',
                'semester_id' => 'required|exists:semesters,semester_id',
                'batch_year' => 'required|integer|digits:4',
            ]);
            $runningNumber = StudentProfile::where('batch_year', $request->batch_year)->count() + 1;
            $formattedRunningNumber = str_pad($runningNumber, 4, '0', STR_PAD_LEFT);
            $generatedNIM = $request->batch_year . $formattedRunningNumber;

            $user->studentProfile()->create([
                'student_number' => $generatedNIM,
                'faculty_id' => $request->faculty_id,
                'major_id' => $request->major_id,
                'semester_id' => $request->semester_id,
                'batch_year' => $request->batch_year,
            ]);
        }

        if ($request->role_id == 2) {
             $request->validate([
                'faculty_id' => 'required|exists:faculties,faculty_id',
            ]);
            $runningNumber = LecturerProfile::count() + 1;
            $generatedNIDN = 'D' . str_pad($runningNumber, 6, '0', STR_PAD_LEFT);

            $user->lecturerProfile()->create([
                'lecturer_number' => $generatedNIDN,
                'faculty_id' => $request->faculty_id,
                'title' => $request->title,
                'position' => $request->position,
            ]);
        }

        return to_route('admin.users.index')->with('success', 'User created successfully.');
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'full_name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users,email,' . $user->user_id . ',user_id',
            'role_id' => 'required|integer|in:1,2,3',
            'phone_number' => 'nullable|string|max:20',
            'birth_date' => 'nullable|date',

            'profile_picture' => 'nullable|image|mimes:jpeg,png,jpg,gif|max:2048',
        ]);

        $userData = [
            'full_name' => $request->full_name,
            'email' => $request->email,
            'phone_number' => $request->phone_number,
            'birth_date' => $request->birth_date,
        ];


        if ($request->hasFile('profile_picture')) {

            if ($user->profile_picture) {

                $oldPath = str_replace('/storage/', '', $user->profile_picture);
                if (Storage::disk('public')->exists($oldPath)) {
                    Storage::disk('public')->delete($oldPath);
                }
            }


            $path = $request->file('profile_picture')->store('profile_pictures', 'public');
            $userData['profile_picture'] = '/storage/' . $path;
        }

        $user->update($userData);


        if ($user->role_id == 3) {
             $request->validate([
                'faculty_id' => 'required|exists:faculties,faculty_id',
                'major_id' => 'required|exists:majors,major_id',
                'semester_id' => 'required|exists:semesters,semester_id',
                'batch_year' => 'required|integer|digits:4',
            ]);
            $user->studentProfile()->updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'student_number' => $user->studentProfile->student_number ?? ($request->batch_year . str_pad(StudentProfile::where('batch_year', $request->batch_year)->count() + 1, 4, '0', STR_PAD_LEFT)),
                    'faculty_id' => $request->faculty_id,
                    'major_id' => $request->major_id,
                    'semester_id' => $request->semester_id,
                    'batch_year' => $request->batch_year,
                ]
            );
        }

        if ($user->role_id == 2) {
             $request->validate([
                'faculty_id' => 'required|exists:faculties,faculty_id',
            ]);
            $user->lecturerProfile()->updateOrCreate(
                ['user_id' => $user->user_id],
                [
                    'lecturer_number' => $user->lecturerProfile->lecturer_number ?? ('D' . str_pad(LecturerProfile::count() + 1, 6, '0', STR_PAD_LEFT)),
                    'faculty_id' => $request->faculty_id,
                    'title' => $request->title,
                    'position' => $request->position,
                ]
            );
        }

        return to_route('admin.users.index')->with('success', 'User updated successfully.');
    }

    public function destroy(User $user)
    {

        if ($user->profile_picture) {
            $oldPath = str_replace('/storage/', '', $user->profile_picture);
            if (Storage::disk('public')->exists($oldPath)) {
                Storage::disk('public')->delete($oldPath);
            }
        }

        $user->delete();
        return to_route('admin.users.index')->with('success', 'User deleted successfully.');
    }
}
