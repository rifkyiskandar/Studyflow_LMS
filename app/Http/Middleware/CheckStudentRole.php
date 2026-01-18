<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;
use Illuminate\Support\Facades\Auth;

class CheckStudentRole
{
    public function handle(Request $request, Closure $next): Response
    {

        if (Auth::check() && Auth::user()->role_id == 3) {
            return $next($request);
        }


        return redirect('/')->with('error', 'Access denied. Student area only.');
    }
}
