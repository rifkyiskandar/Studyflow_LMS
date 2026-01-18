<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Billing;
use App\Models\Payment;
use App\Models\PaymentDetail;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Midtrans\Config;
use Midtrans\Snap;

class PaymentController extends Controller
{
    public function __construct()
    {
        Config::$serverKey = config('services.midtrans.server_key');
        Config::$isProduction = config('services.midtrans.is_production');
        Config::$isSanitized = config('services.midtrans.is_sanitized');
        Config::$is3ds = config('services.midtrans.is_3ds');
    }

    public function create(Request $request)
    {
        $request->validate([
            'billing_ids' => 'required|array',
            'billing_ids.*' => 'exists:billings,billing_id'
        ]);

        $user = Auth::user();

        $billings = Billing::whereIn('billing_id', $request->billing_ids)
            ->where('student_id', $user->user_id)
            ->whereIn('status', ['unpaid', 'overdue'])
            ->get();

        if ($billings->isEmpty()) {
            return response()->json(['message' => 'Tagihan tidak valid.'], 400);
        }

        $totalAmount = $billings->sum('amount');
        $orderId = 'PAY-' . time() . '-' . $user->user_id . '-' . rand(100, 999);

        try {
            $snapToken = DB::transaction(function () use ($user, $billings, $totalAmount, $orderId) {

                $payment = Payment::create([
                    'student_id' => $user->user_id,
                    'order_id' => $orderId,
                    'total_amount' => $totalAmount,
                    'status' => 'pending',
                ]);

                foreach ($billings as $bill) {
                    PaymentDetail::create([
                        'payment_id' => $payment->payment_id,
                        'billing_id' => $bill->billing_id,
                        'amount_paid' => $bill->amount
                    ]);
                }


                $overrideUrl = env('MIDTRANS_NOTIFICATION_URL');

                if (!$overrideUrl) {


                    $overrideUrl = route('api.midtrans.webhook');
                }


                Config::$overrideNotifUrl = $overrideUrl;

                $params = [
                    'transaction_details' => [
                        'order_id' => $orderId,
                        'gross_amount' => (int) $totalAmount,
                    ],
                    'customer_details' => [
                        'first_name' => $user->full_name,
                        'email' => $user->email,
                        'phone' => $user->phone_number,
                    ],
                    'callbacks' => [
                        'finish' => route('student.bills.index'),
                    ]
                ];

                $snapToken = Snap::getSnapToken($params);
                $payment->update(['snap_token' => $snapToken]);

                return $snapToken;
            });

            return response()->json(['snap_token' => $snapToken]);

        } catch (\Exception $e) {
            return response()->json(['message' => $e->getMessage()], 500);
        }
    }
}
