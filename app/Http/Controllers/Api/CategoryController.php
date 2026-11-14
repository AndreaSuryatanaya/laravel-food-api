<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Http\Resources\CategoryResource;
use App\Models\Category;

class CategoryController extends Controller
{
    public function index()
    {
        // return response()->json([
        //     'data' => Category::orderBy('name')->get(),
        // ]);

        return response()->json([
            'data' => CategoryResource::collection(Category::orderBy('name')->get()),
        ]);
    }
}


// data : {
//          id: 1,
//          name: Makanan,
// 
// }