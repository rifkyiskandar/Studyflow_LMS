<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Faculty;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class FacultyController extends Controller
{
    public function index(Request $request)
    {
        $faculties = Faculty::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('faculty_name', 'like', "%{$search}%");
            })
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Faculties/Index', [
            'faculties' => $faculties,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'faculty_name' => 'required|string|max:255|unique:faculties',
        ]);

        Faculty::create($request->all());


        return to_route('admin.faculties.index')
            ->with('success', 'Faculty created successfully.');
    }

    public function update(Request $request, Faculty $faculty)
    {
        $request->validate([
            'faculty_name' => [
                'required', 'string', 'max:255',
                Rule::unique('faculties')->ignore($faculty->faculty_id, 'faculty_id')
            ]
        ]);

        $faculty->update($request->all());


        return to_route('admin.faculties.index')
            ->with('success', 'Faculty updated successfully.');
    }

    public function destroy(Faculty $faculty)
    {

        if ($faculty->majors()->exists()) {
            return back()->withErrors([
                'error' => 'Cannot delete faculty. It is still associated with majors.'
            ]);
        }

        $faculty->delete();


        return to_route('admin.faculties.index')
            ->with('success', 'Faculty deleted successfully.');
    }
}
