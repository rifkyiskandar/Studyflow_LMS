<?php

namespace App\Http\Middleware;

use Illuminate\Http\Request;
use Inertia\Middleware;
use Illuminate\Support\Facades\Auth;

class HandleInertiaRequests extends Middleware
{
    /**
     * The root template that is loaded on the first page visit.
     *
     * @var string
     */
    protected $rootView = 'app';

    /**
     * Determine the current asset version.
     */
    public function version(Request $request): string|null
    {
        return parent::version($request);
    }

    /**
     * Define the props that are shared by default.
     */
    public function share(Request $request): array
    {
        return array_merge(parent::share($request), [

            'auth' => [
                'user' => $request->user() ? [
                    'user_id' => $request->user()->user_id,
                    'full_name' => $request->user()->full_name,
                    'email' => $request->user()->email,
                    'role_id' => $request->user()->role_id,
                    'role' => match($request->user()->role_id) {
                        1 => 'Admin',
                        2 => 'Lecturer',
                        3 => 'Student',
                        default => 'User'
                    },
                    'avatar' => $request->user()->profile_picture,
                ] : null,
            ],

            'flash' => [
                'success' => fn () => $request->session()->get('success'),
                'error' => fn () => $request->session()->get('error'),
            ],

            'env' => [
                'midtrans_client_key' => config('services.midtrans.client_key'),
            ],

            'current_locale' => app()->getLocale(),

            'translations' => function () {
                $locale = app()->getLocale();
                $path = lang_path("{$locale}.json");

                if (file_exists($path)) {
                    return json_decode(file_get_contents($path), true);
                }

                return [];
            },

        ]);
    }
}
