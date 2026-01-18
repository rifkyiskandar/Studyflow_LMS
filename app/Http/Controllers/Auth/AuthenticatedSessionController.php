<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use App\Http\Requests\Auth\LoginRequest; 
use Illuminate\Http\Request;
use Illuminate\Http\RedirectResponse;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;

class AuthenticatedSessionController extends Controller
{
    
    public function create()
    {
        return Inertia::render('Auth/Login', [
            'status' => session('status'),
        ]);
    }

    
    public function store(LoginRequest $request): RedirectResponse
    {

        $credentials = $request->validated();


        if (Auth::attempt($credentials, $request->boolean('remember'))) {

            $request->session()->regenerate();


            $role = Auth::user()->role_id;


            if ($role == 1) { 
                return redirect()->intended(route('admin.dashboard'));
            }
            elseif ($role == 3) { 

                return redirect()->intended(route('student.dashboard'));
            }
            elseif ($role == 2) { 

                return redirect()->intended('/');
            }


            return redirect()->intended('/');
        }


        return back()->withErrors([
            'email' => 'The provided credentials do not match our records.',
        ])->onlyInput('email');
    }

    
    public function destroy(Request $request): RedirectResponse
    {
        Auth::guard('web')->logout();

        $request->session()->invalidate();

        $request->session()->regenerateToken();

        return redirect('/');
    }
}
