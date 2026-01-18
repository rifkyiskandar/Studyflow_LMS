<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Billing;
use App\Models\Semester;
use App\Models\KrsRequest;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class DashboardController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $student */
        $student = Auth::user();


        $student->load(['studentProfile.major.faculty']);


        $activeSemester = Semester::where('is_active', true)->first();
        $semesterName = $activeSemester ? $activeSemester->semester_name : '-';
        $activeSemesterId = $activeSemester ? $activeSemester->semester_id : null;




        $sksTaken = 0;

        if ($activeSemesterId) {
            $krs = KrsRequest::where('student_id', $student->user_id)
                ->where('semester_id', $activeSemesterId)
                ->first();



            if ($krs && ($krs->status === 'approved' || $krs->status === 'paid')) {
                $sksTaken = $krs->total_sks;
            }
        }


        $unpaidBill = Billing::where('student_id', $student->user_id)
            ->whereIn('status', ['unpaid', 'overdue'])
            ->sum('amount');


        $dashboardData = [
            'semester_level' => $student->studentProfile->current_semester_level ?? 1,


            'sks_taken' => (int) $sksTaken,
            'max_sks' => 24,
            'unpaid_bill' => (int) $unpaidBill,
            'gpa' => $student->studentProfile->gpa ?? 0,
            'active_semester_name' => $semesterName
        ];

        return Inertia::render('Student/Dashboard', [
            'student' => $student,
            'dashboardData' => $dashboardData
        ]);
    }
}
