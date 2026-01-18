<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Major;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class MajorController extends Controller
{
    public function index(Request $request)
    {

        $majors = Major::query()
            ->with('faculty')
            ->when($request->input('search'), function ($query, $search) {
                $query->where(function($q) use ($search) {
                    $q->where('major_name', 'like', "%{$search}%")
                      ->orWhereHas('faculty', function ($q2) use ($search) {
                          $q2->where('faculty_name', 'like', "%{$search}%");
                      });
                });
            })
            ->when($request->input('faculty_id'), function ($query, $id) {
                $query->where('faculty_id', $id);
            })
            ->paginate(10)
            ->withQueryString();


        $faculties = Faculty::all(['faculty_id', 'faculty_name']);

        return Inertia::render('Admin/Majors/Index', [
            'majors' => $majors,
            'faculties' => $faculties,
            'filters' => $request->only(['search', 'faculty_id'])
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'major_name' => 'required|string|max:255|unique:majors',
            'faculty_id' => 'required|exists:faculties,faculty_id'
        ]);

        Major::create($request->all());

        return to_route('admin.majors.index')
            ->with('success', 'Major created successfully.');
    }

    public function update(Request $request, Major $major)
    {
        $request->validate([
            'major_name' => [
                'required', 'string', 'max:255',
                Rule::unique('majors')->ignore($major->major_id, 'major_id')
            ],
            'faculty_id' => 'required|exists:faculties,faculty_id'
        ]);

        $major->update($request->all());

        return to_route('admin.majors.index')
            ->with('success', 'Major updated successfully.');
    }

    public function destroy(Major $major)
    {
        $major->delete();

        return to_route('admin.majors.index')
            ->with('success', 'Major deleted successfully.');
    }
}
