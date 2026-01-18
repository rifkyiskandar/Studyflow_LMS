<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\CostComponent;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Validation\Rule;

class CostComponentController extends Controller
{
    public function index(Request $request)
    {
        $components = CostComponent::query()
            ->when($request->input('search'), function ($query, $search) {
                $query->where('component_name', 'like', "%{$search}%")
                      ->orWhere('component_code', 'like', "%{$search}%");
            })
            ->orderBy('component_code')
            ->paginate(10)
            ->withQueryString();

        return Inertia::render('Admin/Finance/CostComponents/Index', [
            'components' => $components,
            'filters' => $request->only('search')
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'component_name' => 'required|string|max:255',
            'component_code' => 'required|string|max:50|unique:cost_components,component_code',
            'billing_type'   => 'required|in:PER_SKS,PER_COURSE,PER_SEMESTER,ONE_TIME',
            'amount'         => 'required|numeric|min:0',
        ]);

        CostComponent::create($request->all());

        return to_route('admin.cost_components.index')
            ->with('success', 'Cost component created successfully.');
    }

    public function update(Request $request, CostComponent $costComponent)
    {
        $request->validate([
            'component_name' => 'required|string|max:255',
            'component_code' => [
                'required', 'string', 'max:50',
                Rule::unique('cost_components')->ignore($costComponent->cost_component_id, 'cost_component_id')
            ],
            'billing_type'   => 'required|in:PER_SKS,PER_COURSE,PER_SEMESTER,ONE_TIME',
            'amount'         => 'required|numeric|min:0',
        ]);

        $costComponent->update($request->all());

        return to_route('admin.cost_components.index')
            ->with('success', 'Cost component updated successfully.');
    }

    public function destroy(CostComponent $costComponent)
    {
        $costComponent->delete();

        return to_route('admin.cost_components.index')
            ->with('success', 'Cost component deleted successfully.');
    }
}
