<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\HasMany;

class Category extends Model
{
    // ini untuk kebutuhan Testing
    use HasFactory;

    protected $fillable = ['name', 'description'];

    // table Relasi ke Product
    // kita kasih tau hubungan antar tabel ke 
    public function products(): HasMany
    {
        return $this->hasMany(Product::class);
    }
}
