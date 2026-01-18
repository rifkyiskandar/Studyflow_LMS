<?php

namespace App\Http\Controllers\Admin;

use Illuminate\Support\Facades\Auth;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Course;
use App\Models\Payment;
use Illuminate\Support\Carbon;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {

        $totalStudents = User::where('role_id', 3)->count();

        $newStudentsThisMonth = User::where('role_id', 3)
            ->whereMonth('created_at', now()->month)
            ->whereYear('created_at', now()->year)
            ->count();

        $totalLecturers = User::where('role_id', 2)->count();

        $activeCourses = Course::count();


        $recentPayments = Payment::with('student')
            ->orderBy('created_at', 'desc')
            ->take(5)
            ->get()
            ->map(function ($payment) {
                return [
                    'id' => $payment->payment_id,
                    'order_id' => $payment->order_id,

                    'student_name' => $payment->student ? $payment->student->full_name : 'Unknown Student',
                    'amount' => $payment->total_amount,
                    'status' => $payment->status,
                    'date' => $payment->created_at->toIso8601String(),
                ];
            });

        return Inertia::render('Admin/Dashboard', [
            'auth' => [
                'user' => Auth::user(),
            ],
            'stats' => [
                'students' => [
                    'total' => $totalStudents,
                    'new_this_month' => $newStudentsThisMonth,
                ],
                'lecturers' => [
                    'total' => $totalLecturers,
                ],
                'courses' => [
                    'total' => $activeCourses,
                ],
            ],

            'recentPayments' => $recentPayments,
        ]);
    }
}
