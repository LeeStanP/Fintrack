<?php

use App\Http\Controllers\Api\TransactionController;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\InvestmentController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;


Route::post('/register', [AuthController::class, 'register']);
Route::post('/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/me', [AuthController::class, 'me']);
    Route::post('/logout', [AuthController::class, 'logout']);

    Route::get('/transactions', [TransactionController::class, 'index']);
    Route::post('/transactions', [TransactionController::class, 'store']);
    Route::delete('/transactions/{transaction}', [TransactionController::class, 'destroy']);

    Route::get('/dashboard', [TransactionController::class, 'dashboard']);

    Route::get('/portfolio', [InvestmentController::class, 'index']);
    Route::post('/portfolio', [InvestmentController::class, 'store']);
    Route::get('/portfolio/summary', [InvestmentController::class, 'summary']);
    Route::post('/portfolio/buy', [InvestmentController::class, 'buy']);
    Route::post('/portfolio/sell', [InvestmentController::class, 'sell']);
});