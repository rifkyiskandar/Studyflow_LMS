<?php

namespace App\Http\Controllers\Student;

use App\Http\Controllers\Controller;
use App\Models\CourseClass;
use App\Models\KrsRequest;
use App\Models\KrsItem;
use App\Models\Curriculum;
use App\Models\Semester;
use App\Models\Billing;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;

class KRSController extends Controller
{
    public function index()
    {
        /** @var \App\Models\User $user */
        $user = Auth::user();
        $studentProfile = $user->studentProfile;


        $activeSemester = Semester::where('is_active', true)->first();
        if (!$activeSemester) {
            return back()->with('error', 'Tidak ada semester aktif saat ini.');
        }


        $krs = KrsRequest::firstOrCreate(
            ['student_id' => $user->user_id, 'semester_id' => $activeSemester->semester_id],
            ['status' => 'draft', 'total_sks' => 0]
        );


        if ($krs->status === 'submitted') {
            $hasPaidBill = Billing::where('student_id', $user->user_id)
                ->where('semester_id', $activeSemester->semester_id)
                ->whereHas('paymentDetails.payment', fn($q) => $q->whereIn('status', ['settlement', 'capture', 'paid']))
                ->exists();

            if ($hasPaidBill) {
                $krs->update(['status' => 'approved']);
                Billing::where('student_id', $user->user_id)
                    ->where('semester_id', $activeSemester->semester_id)
                    ->update(['status' => 'paid']);
            }
        }


        if ($krs->status === 'draft') {
            $this->autoAssignMandatoryCourses($user, $krs, $activeSemester->semester_id);
        }


        $krs->refresh();
        $krs->load(['items.class.course', 'items.class.room', 'items.class.lecturer']);


        $gradeHistory = \App\Models\Grade::where('student_id', $user->user_id)->get()->keyBy('course_id');

        $currentSemesterLevel = $studentProfile->current_semester_level;
        $curriculums = Curriculum::where('major_id', $studentProfile->major_id)
            ->where(function($query) use ($currentSemesterLevel) {
                $query->where('semester', '<=', $currentSemesterLevel)
                      ->orWhere('category', 'MKU');
            })->get();

        $courseCategories = $curriculums->pluck('category', 'course_id');
        $courseIds = $curriculums->pluck('course_id');

        $availableClasses = CourseClass::with(['course', 'lecturer', 'room'])
            ->whereIn('course_id', $courseIds)
            ->where('semester_id', $activeSemester->semester_id)
            ->get()
            ->map(function ($class) use ($courseCategories, $krs, $gradeHistory) {
                $enrolledCount = KrsItem::where('class_id', $class->class_id)->count();
                $isTaken = $krs->items->contains('class_id', $class->class_id);

                $history = $gradeHistory[$class->course_id] ?? null;
                $academicStatus = 'Normal';
                $pastGrade = null;

                if ($history) {
                    $pastGrade = $history->grade_char;
                    if (in_array($pastGrade, ['A', 'B', 'C'])) $academicStatus = 'Passed';
                    elseif (in_array($pastGrade, ['D', 'E', 'F'])) $academicStatus = 'Retake';
                }

                return [
                    'id' => $class->class_id,
                    'courseCode' => $class->course->course_code,
                    'courseName' => $class->course->course_name,
                    'className' => $class->class_name ?? 'A',
                    'category' => $courseCategories[$class->course_id] ?? 'PILIHAN',
                    'sks' => $class->course->sks,
                    'lecturer' => $class->lecturer->full_name,
                    'day' => $class->day,
                    'start_time' => substr($class->start_time, 0, 5),
                    'end_time' => substr($class->end_time, 0, 5),
                    'room' => $class->room->room_name,
                    'quota' => $class->room->capacity,
                    'enrolled' => $enrolledCount,
                    'isFull' => $enrolledCount >= $class->room->capacity,
                    'isTaken' => $isTaken,
                    'academicStatus' => $academicStatus,
                    'pastGrade' => $pastGrade
                ];
            });

        return Inertia::render('Student/KRS/Create', [
            'krs' => $krs,
            'availableClasses' => $availableClasses,
            'maxSks' => 24,
            'flash' => session('flash')
        ]);
    }

    /**
     * Logic Auto-Assign Matkul Wajib
     */
    private function autoAssignMandatoryCourses($user, $krs, $semesterId)
    {
        $studentLevel = $user->studentProfile->current_semester_level;



        $mandatoryCourses = Curriculum::where('major_id', $user->studentProfile->major_id)
            ->where('semester', $studentLevel)
            ->whereIn('category', ['WAJIB_PRODI', 'WAJIB_FAKULTAS', 'MKU'])
            ->get();


        $existingCourseIds = $krs->items()->with('class')->get()->pluck('class.course_id')->toArray();

        $coursesToAssign = $mandatoryCourses->filter(function($curr) use ($existingCourseIds) {
            return !in_array($curr->course_id, $existingCourseIds);
        });

        if ($coursesToAssign->isEmpty()) return;

        DB::transaction(function () use ($krs, $coursesToAssign, $semesterId) {
            foreach ($coursesToAssign as $curriculum) {

                $randomClass = CourseClass::where('course_id', $curriculum->course_id)
                    ->where('semester_id', $semesterId)
                    ->with('room')
                    ->inRandomOrder()
                    ->get()
                    ->first(function($cls) {

                        $enrolled = KrsItem::where('class_id', $cls->class_id)->count();
                        return $enrolled < $cls->room->capacity;
                    });


                if ($randomClass) {





                    KrsItem::create([
                        'krs_id' => $krs->krs_id,
                        'class_id' => $randomClass->class_id,
                        'sks' => $randomClass->course->sks,
                        'status' => 'draft'
                    ]);
                    $krs->increment('total_sks', $randomClass->course->sks);
                }
            }
        });
    }

    public function submit()
    {
        $user = Auth::user();
        $krs = KrsRequest::where('student_id', $user->user_id)->where('status', 'draft')->firstOrFail();


        $studentLevel = $user->studentProfile->current_semester_level;

        $mandatoryCourseIds = Curriculum::where('major_id', $user->studentProfile->major_id)
            ->where('semester', $studentLevel)
            ->whereIn('category', ['WAJIB_PRODI', 'WAJIB_FAKULTAS', 'MKU'])
            ->pluck('course_id')
            ->toArray();

        $takenCourseIds = $krs->items()->with('class')->get()->pluck('class.course_id')->toArray();


        $missingCourses = array_diff($mandatoryCourseIds, $takenCourseIds);

        if (!empty($missingCourses)) {

            $courseNames = \App\Models\Course::whereIn('course_id', $missingCourses)->pluck('course_name')->join(', ');
            return back()->withErrors(['error' => "Anda belum mengambil semua mata kuliah wajib semester ini: {$courseNames}."]);
        }


        if ($krs->total_sks < 1) {
            return back()->withErrors(['error' => 'Pilih mata kuliah terlebih dahulu.']);
        }

        DB::transaction(function () use ($krs, $user) {
            $biayaSksComp = \App\Models\CostComponent::where('billing_type', 'PER_SKS')->first();
            $biayaSmtComp = \App\Models\CostComponent::where('billing_type', 'PER_SEMESTER')->first();
            $dueDate = now()->addWeeks(2);


            if ($biayaSksComp) {
                \App\Models\Billing::create([
                    'student_id' => $user->user_id,
                    'semester_id' => $krs->semester_id,
                    'cost_component_id' => $biayaSksComp->cost_component_id,
                    'description' => "Biaya SKS ({$krs->total_sks} SKS x " . number_format($biayaSksComp->amount) . ")",
                    'amount' => $krs->total_sks * $biayaSksComp->amount,
                    'due_date' => $dueDate,
                    'status' => 'unpaid'
                ]);
            }


            if ($biayaSmtComp) {
                \App\Models\Billing::create([
                    'student_id' => $user->user_id,
                    'semester_id' => $krs->semester_id,
                    'cost_component_id' => $biayaSmtComp->cost_component_id,
                    'description' => "Biaya Tetap Semester (BPP)",
                    'amount' => $biayaSmtComp->amount,
                    'due_date' => $dueDate,
                    'status' => 'unpaid'
                ]);
            }

            $krs->update(['status' => 'submitted', 'submitted_at' => now()]);
        });

        return to_route('student.bills.index')->with('success', 'KRS Berhasil Di-Checkout. Tagihan telah dibuat.');
    }


    public function store(Request $request) {


        $user = Auth::user();
        $classId = $request->input('class_id');
        $classToAdd = CourseClass::with(['course', 'room'])->findOrFail($classId);

        $krs = KrsRequest::where('student_id', $user->user_id)->where('status', 'draft')->firstOrFail();


        $existingItem = KrsItem::where('krs_id', $krs->krs_id)
            ->whereHas('class', fn($q) => $q->where('course_id', $classToAdd->course_id))
            ->first();


        $sksToAdd = $existingItem ? 0 : $classToAdd->course->sks;
        if (($krs->total_sks + $sksToAdd) > 24) return back()->withErrors(['error' => 'Batas SKS terlampaui.']);


        $myClasses = KrsItem::where('krs_id', $krs->krs_id)
            ->when($existingItem, fn($q) => $q->where('krs_item_id', '!=', $existingItem->krs_item_id))
            ->with('class')->get()->pluck('class');

        foreach ($myClasses as $myClass) {
            if ($myClass->day == $classToAdd->day) {
                if (($classToAdd->start_time >= $myClass->start_time && $classToAdd->start_time < $myClass->end_time) ||
                    ($classToAdd->end_time > $myClass->start_time && $classToAdd->end_time <= $myClass->end_time)) {
                    return back()->withErrors(['error' => "Jadwal bentrok dengan {$myClass->course->course_name}."]);
                }
            }
        }


        if (KrsItem::where('class_id', $classId)->count() >= $classToAdd->room->capacity) {
            return back()->withErrors(['error' => 'Kelas penuh.']);
        }

        DB::transaction(function () use ($krs, $classToAdd, $existingItem) {
            if ($existingItem) {
                $krs->decrement('total_sks', $existingItem->sks);
                $existingItem->delete();
            }
            KrsItem::create(['krs_id' => $krs->krs_id, 'class_id' => $classToAdd->class_id, 'sks' => $classToAdd->course->sks, 'status' => 'draft']);
            $krs->increment('total_sks', $classToAdd->course->sks);
        });

        return back()->with('success', $existingItem ? 'Jadwal berhasil ditukar.' : 'Mata kuliah berhasil ditambahkan.');
    }

    public function destroy($itemId) {

        $item = KrsItem::with('class')->findOrFail($itemId);
        $krs = KrsRequest::findOrFail($item->krs_id);
        $user = Auth::user();

        $curriculum = Curriculum::where('course_id', $item->class->course_id)
            ->where('major_id', $user->studentProfile->major_id)
            ->first();

        if ($curriculum && in_array($curriculum->category, ['WAJIB_PRODI', 'WAJIB_FAKULTAS', 'MKU'])) {
            return back()->withErrors(['error' => 'Mata kuliah Wajib tidak bisa dihapus. Silakan pilih kelas lain untuk menukar jadwal.']);
        }

        DB::transaction(function () use ($item, $krs) {
            $sks = $item->sks;
            $item->delete();
            $krs->decrement('total_sks', $sks);
        });

        return back()->with('success', 'Mata kuliah dihapus.');
    }
}
