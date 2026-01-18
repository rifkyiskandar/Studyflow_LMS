<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\Billing;
use App\Models\Payment;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class BillingController extends Controller
{
    public function index()
    {
        $user = Auth::user();


        $billings = Billing::with(['costComponent', 'semester'])
            ->where('student_id', $user->user_id)
            ->orderBy('status', 'desc')
            ->orderBy('created_at', 'desc')
            ->get();



        $paymentHistory = Payment::where('student_id', $user->user_id)
            ->orderBy('created_at', 'desc')
            ->get();




        $totalPaid = $paymentHistory
            ->whereIn('status', ['settlement', 'capture', 'paid'])
            ->sum('total_amount');

        return Inertia::render('Student/Billing/Index', [
            'billings' => $billings,
            'paymentHistory' => $paymentHistory,
            'totalPaid' => $totalPaid,
            'env' => [
                'midtrans_client_key' => config('services.midtrans.client_key')
            ]
        ]);
    }
}   
