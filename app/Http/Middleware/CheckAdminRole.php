<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAdminRole
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {

        if (Auth::check() && Auth::user()->role_id == 1) {
            return $next($request);
        }


        return redirect()->route('login')->with('error', 'You do not have permission to access this page.');
    }
}
