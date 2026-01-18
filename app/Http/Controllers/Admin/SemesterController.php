<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Semester;
use Illuminate\Http\Request;
use Inertia\Inertia;

class SemesterController extends Controller
{
    public function index(Request $request)
    {
        $semesters = Semester::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('semester_name', 'like', "%{$search}%")
                      ->orWhere('academic_year', 'like', "%{$search}%");
            })
            ->orderBy('academic_year', 'desc')
            ->orderBy('term', 'desc')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Semesters/Index', [
            'semesters' => $semesters,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'academic_year' => 'required|string|max:20',
            'term'          => 'required|in:Ganjil,Genap,Pendek',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after:start_date',
            'is_active'     => 'boolean',
        ]);


        $validatedData['semester_name'] = $validatedData['term'] . ' ' . $validatedData['academic_year'];

        if ($validatedData['is_active']) {
            Semester::query()->update(['is_active' => false]);
        }

        Semester::create($validatedData);

        return to_route('admin.semesters.index')
            ->with('success', 'Semester created successfully.');
    }

    public function update(Request $request, Semester $semester)
    {
        $validatedData = $request->validate([
            'academic_year' => 'required|string|max:20',
            'term'          => 'required|in:Ganjil,Genap,Pendek',
            'start_date'    => 'required|date',
            'end_date'      => 'required|date|after:start_date',
            'is_active'     => 'boolean',
        ]);

        $validatedData['semester_name'] = $validatedData['term'] . ' ' . $validatedData['academic_year'];

        if ($validatedData['is_active']) {
            Semester::query()->where('semester_id', '!=', $semester->semester_id)->update(['is_active' => false]);
        }

        $semester->update($validatedData);

        return to_route('admin.semesters.index')
            ->with('success', 'Semester updated successfully.');
    }

    public function destroy(Semester $semester)
    {



        $semester->delete();

        return to_route('admin.semesters.index')
            ->with('success', 'Semester deleted successfully.');
    }
}
