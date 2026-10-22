<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->foreignId('user_id')
                ->after('id')
                ->constrained()
                ->cascadeOnDelete();

            $table->string('type')->after('user_id');
            $table->string('category')->after('type');
            $table->string('description')->after('category');
            $table->decimal('amount', 15, 2)->after('description');
            $table->date('transaction_date')->after('amount');
        });
    }

    public function down(): void
    {
        Schema::table('transactions', function (Blueprint $table) {
            $table->dropForeign(['user_id']);
            $table->dropColumn([
                'user_id',
                'type',
                'category',
                'description',
                'amount',
                'transaction_date',
            ]);
        });
    }
};