<?php

use App\Http\Controllers\ProfileController;
use Illuminate\Foundation\Application;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Session;
use Illuminate\Support\Facades\Auth;
use Inertia\Inertia;
use App\Http\Controllers\Admin\DashboardController;
use App\Http\Controllers\Auth\AuthenticatedSessionController;

use App\Http\Controllers\Admin\FacultyController;
use App\Http\Controllers\Admin\MajorController;
use App\Http\Controllers\Admin\UserController;
use App\Http\Controllers\Admin\SemesterController;
use App\Http\Controllers\Admin\CourseController;
use App\Http\Controllers\Admin\RoomController;
use App\Http\Controllers\Admin\CourseClassController;
use App\Http\Controllers\Admin\CurriculumController;
use App\Http\Controllers\Admin\CostComponentController;

use App\Http\Controllers\Student\BillingController;
use App\Http\Controllers\Student\PaymentController;

/*
|--------------------------------------------------------------------------
| Web Routes
|--------------------------------------------------------------------------
*/

Route::get('/', function () {
    if (Auth::check()) {
        $role = Auth::user()->role_id;

        if ($role == 1) {
            return redirect()->route('admin.dashboard');
        }
        elseif ($role == 3) {
            return redirect()->route('student.dashboard');
        }
    }

    return Inertia::render('Welcome');
});

Route::middleware('auth')->group(function () {
    Route::post('logout', [AuthenticatedSessionController::class, 'destroy'])->name('logout');

    Route::get('/profile', [ProfileController::class, 'edit'])->name('profile.edit');
    Route::patch('/profile', [ProfileController::class, 'update'])->name('profile.update');
    Route::delete('/profile', [ProfileController::class, 'destroy'])->name('profile.destroy');

    Route::middleware('admin')->prefix('admin')->name('admin.')->group(function () {

        Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

        Route::resource('users', UserController::class)->except(['show']);
        Route::resource('faculties', FacultyController::class)->except(['create', 'edit', 'show']);
        Route::resource('majors', MajorController::class)->except(['create', 'edit', 'show']);
        Route::resource('semesters', SemesterController::class)->except(['create', 'edit', 'show']);
        Route::resource('courses', CourseController::class)->except(['show']);
        Route::resource('rooms', RoomController::class)->except(['create', 'edit', 'show']);
        Route::resource('classes', CourseClassController::class)->except(['show']);

        Route::get('curriculums', [CurriculumController::class, 'index'])->name('curriculums.index');
        Route::post('curriculums', [CurriculumController::class, 'store'])->name('curriculums.store');
        Route::delete('curriculums/{id}', [CurriculumController::class, 'destroy'])->name('curriculums.destroy');

        Route::resource('cost_components', CostComponentController::class)->except(['show']);
    });

    Route::middleware(['auth', 'verified'])->prefix('student')->name('student.')->group(function () {
        Route::get('dashboard', [App\Http\Controllers\Student\DashboardController::class, 'index'])->name('dashboard');

        Route::get('krs/create', [App\Http\Controllers\Student\KRSController::class, 'index'])->name('krs.create');
        Route::post('krs/store', [App\Http\Controllers\Student\KRSController::class, 'store'])->name('krs.store');
        Route::delete('krs/{id}', [App\Http\Controllers\Student\KRSController::class, 'destroy'])->name('krs.destroy');
        Route::post('krs/submit', [App\Http\Controllers\Student\KRSController::class, 'submit'])->name('krs.submit');

        Route::get('bills', [BillingController::class, 'index'])->name('bills.index');

        Route::post('payment/create', [PaymentController::class, 'create'])->name('payment.create');

        Route::get('profile', [\App\Http\Controllers\Student\ProfileController::class, 'edit'])->name('profile.edit');
        Route::patch('profile', [\App\Http\Controllers\Student\ProfileController::class, 'update'])->name('profile.update');
        Route::put('password', [\App\Http\Controllers\Student\ProfileController::class, 'updatePassword'])->name('password.update');

        Route::get('catalog', [App\Http\Controllers\Student\CatalogController::class, 'index'])->name('catalog.index');
    });
});

Route::get('language/{locale}', function ($locale) {
    if (in_array($locale, ['en', 'id'])) {
        Session::put('locale', $locale);
    }
    return back();
})->name('language.switch');

require __DIR__.'/auth.php';
