<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use Illuminate\Http\Request;
use App\Models\Transaction;
use Illuminate\Support\Facades\DB;

class InvestmentController extends Controller
{
    /**
     * Get user's portfolio.
     */
    public function index(Request $request)
    {
        $investments = Investment::where(
            'user_id',
            $request->user()->id
        )->get();

        return response()->json([
            'investments' => $investments,
        ]);
    }

    /**
     * Add an investment.
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'symbol' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'type' => 'required|string|max:50',
            'quantity' => 'required|numeric|min:0',
            'average_buy_price' => 'required|numeric|min:0',
            'current_price' => 'required|numeric|min:0',
        ]);

        $investment = Investment::create([
            'user_id' => $request->user()->id,
            'symbol' => $validated['symbol'],
            'name' => $validated['name'],
            'type' => $validated['type'],
            'quantity' => $validated['quantity'],
            'average_buy_price' => $validated['average_buy_price'],
            'current_price' => $validated['current_price'],
        ]);

        return response()->json([
            'message' => 'Investment created successfully',
            'investment' => $investment,
        ], 201);
    }
    public function summary(Request $request)
    {
        $investments = Investment::where(
            'user_id',
            $request->user()->id
        )->get();

        $totalInvested = 0;
        $totalValue = 0;

        foreach ($investments as $investment) {
            $totalInvested +=
                $investment->quantity *
                $investment->average_buy_price;

            $totalValue +=
                $investment->quantity *
                $investment->current_price;
        }

        $profitLoss = $totalValue - $totalInvested;

        $returnPercentage = $totalInvested > 0
            ? ($profitLoss / $totalInvested) * 100
            : 0;

        if ($profitLoss > 0) {
            $outlook = 'positive';
        } elseif ($profitLoss < 0) {
            $outlook = 'negative';
        } else {
            $outlook = 'neutral';
        }

        return response()->json([
            'total_invested' => round($totalInvested, 2),
            'total_value' => round($totalValue, 2),
            'profit_loss' => round($profitLoss, 2),
            'return_percentage' => round($returnPercentage, 2),
            'outlook' => $outlook,
        ]);
    }
    public function buy(Request $request)
    {
        $validated = $request->validate([
            'symbol' => 'required|string|max:20',
            'name' => 'required|string|max:255',
            'quantity' => 'required|numeric|min:0.00000001',
            'price' => 'required|numeric|min:0.01',
        ]);

        $userId = $request->user()->id;

        $quantity = (float) $validated['quantity'];
        $price = (float) $validated['price'];

        $total = $quantity * $price;

        return DB::transaction(function () use (
            $validated,
            $userId,
            $quantity,
            $price,
            $total
        ) {

            $investment = Investment::where('user_id', $userId)
                ->where('symbol', $validated['symbol'])
                ->first();

            if ($investment) {

                $oldQuantity = (float) $investment->quantity;
                $oldAveragePrice = (float) $investment->average_buy_price;

                $newQuantity = $oldQuantity + $quantity;

                $newAveragePrice =
                    (
                        ($oldQuantity * $oldAveragePrice) +
                        ($quantity * $price)
                    )
                    / $newQuantity;

                $investment->update([
                    'quantity' => $newQuantity,
                    'average_buy_price' => $newAveragePrice,
                    'current_price' => $price,
                ]);

            } else {

                $investment = Investment::create([
                    'user_id' => $userId,
                    'symbol' => $validated['symbol'],
                    'name' => $validated['name'],
                    'type' => 'stock',
                    'quantity' => $quantity,
                    'average_buy_price' => $price,
                    'current_price' => $price,
                ]);
            }

            Transaction::create([
                'user_id' => $userId,
                'type' => 'expense',
                'category' => 'Investments',
                'description' => 'Buy ' . $validated['symbol'],
                'amount' => $total,
                'transaction_date' => now()->toDateString(),
            ]);

            return response()->json([
                'message' => 'Investment purchased successfully',

                'investment' => $investment,

                'transaction' => [
                    'type' => 'expense',
                    'category' => 'Investments',
                    'amount' => $total,
                ],
            ], 201);
        });
    }
    public function sell(Request $request)
    {
        $validated = $request->validate([
            'symbol' => 'required|string|max:20',
            'quantity' => 'required|numeric|min:0.00000001',
            'price' => 'required|numeric|min:0.01',
        ]);

        $userId = $request->user()->id;

        $quantity = (float) $validated['quantity'];
        $price = (float) $validated['price'];

        $total = $quantity * $price;

        return DB::transaction(function () use (
            $validated,
            $userId,
            $quantity,
            $price,
            $total
        ) {

            $investment = Investment::where('user_id', $userId)
                ->where('symbol', $validated['symbol'])
                ->first();

            if (!$investment) {
                return response()->json([
                    'message' => 'Investment not found.'
                ], 404);
            }

            $currentQuantity = (float) $investment->quantity;

            if ($quantity > $currentQuantity) {
                return response()->json([
                    'message' => 'You cannot sell more shares than you own.',
                    'available_quantity' => $currentQuantity,
                ], 422);
            }

            $newQuantity = $currentQuantity - $quantity;

            if ($newQuantity == 0) {

                $investment->delete();

            } else {

                $investment->update([
                    'quantity' => $newQuantity,
                    'current_price' => $price,
                ]);
            }

            Transaction::create([
                'user_id' => $userId,
                'type' => 'income',
                'category' => 'Investments',
                'description' => 'Sell ' . $validated['symbol'],
                'amount' => $total,
                'transaction_date' => now()->toDateString(),
            ]);

            return response()->json([
                'message' => 'Investment sold successfully',

                'transaction' => [
                    'type' => 'income',
                    'category' => 'Investments',
                    'amount' => $total,
                ],

                'remaining_quantity' => $newQuantity,
            ], 201);
        });
}
}