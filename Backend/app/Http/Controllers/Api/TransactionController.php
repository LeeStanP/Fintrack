<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Investment;
use App\Models\Transaction;
use Illuminate\Http\Request;

class TransactionController extends Controller
{
    public function index(Request $request)
    {
        $transactions = Transaction::where('user_id', $request->user()->id)
            ->latest('transaction_date')
            ->get();

        return response()->json([
            'transactions' => $transactions,
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:income,expense',
            'category' => 'required|string|max:255',
            'description' => 'required|string|max:255',
            'amount' => 'required|numeric|min:0',
            'transaction_date' => 'required|date',

            // Investment fields
            'symbol' => 'nullable|string|max:20',
            'name' => 'nullable|string|max:255',
            'investment_type' => 'nullable|string|max:50',
            'quantity' => 'nullable|numeric|min:0',
            'price' => 'nullable|numeric|min:0',
        ]);

        $user = $request->user();

        /*
        |--------------------------------------------------------------------------
        | Normal transaction
        |--------------------------------------------------------------------------
        */

        if ($validated['category'] !== 'Investments') {

            $transaction = Transaction::create([
                'user_id' => $user->id,
                'type' => $validated['type'],
                'category' => $validated['category'],
                'description' => $validated['description'],
                'amount' => $validated['amount'],
                'transaction_date' => $validated['transaction_date'],
            ]);

            return response()->json([
                'message' => 'Transaction created successfully',
                'transaction' => $transaction,
            ], 201);
        }

        /*
        |--------------------------------------------------------------------------
        | Investment validation
        |--------------------------------------------------------------------------
        */

        if (
            empty($validated['symbol']) ||
            empty($validated['name']) ||
            empty($validated['quantity']) ||
            empty($validated['price'])
        ) {
            return response()->json([
                'message' => 'Investment information is required.'
            ], 422);
        }

        /*
        |--------------------------------------------------------------------------
        | BUY
        |--------------------------------------------------------------------------
        |
        | Expense + Investments
        |
        */

        if ($validated['type'] === 'expense') {

            $investment = Investment::where('user_id', $user->id)
                ->where('symbol', $validated['symbol'])
                ->first();

            if ($investment) {

                $oldQuantity = (float) $investment->quantity;
                $oldAveragePrice = (float) $investment->average_buy_price;

                $newQuantity = (float) $validated['quantity'];
                $newPrice = (float) $validated['price'];

                $totalQuantity = $oldQuantity + $newQuantity;

                $newAveragePrice =
                    (
                        ($oldQuantity * $oldAveragePrice) +
                        ($newQuantity * $newPrice)
                    ) / $totalQuantity;

                $investment->update([
                    'quantity' => $totalQuantity,
                    'average_buy_price' => $newAveragePrice,
                    'current_price' => $newPrice,
                ]);

            } else {

                $investment = Investment::create([
                    'user_id' => $user->id,
                    'symbol' => $validated['symbol'],
                    'name' => $validated['name'],
                    'type' => $validated['investment_type'] ?? 'stock',
                    'quantity' => $validated['quantity'],
                    'average_buy_price' => $validated['price'],
                    'current_price' => $validated['price'],
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | SELL
        |--------------------------------------------------------------------------
        |
        | Income + Investments
        |
        */

        if ($validated['type'] === 'income') {

            $investment = Investment::where('user_id', $user->id)
                ->where('symbol', $validated['symbol'])
                ->first();

            if (!$investment) {
                return response()->json([
                    'message' => 'Investment not found.'
                ], 404);
            }

            if ((float) $investment->quantity < (float) $validated['quantity']) {
                return response()->json([
                    'message' => 'Insufficient investment quantity.'
                ], 422);
            }

            $remainingQuantity =
                (float) $investment->quantity -
                (float) $validated['quantity'];

            if ($remainingQuantity == 0) {
                $investment->delete();
            } else {
                $investment->update([
                    'quantity' => $remainingQuantity,
                    'current_price' => $validated['price'],
                ]);
            }
        }

        /*
        |--------------------------------------------------------------------------
        | Create transaction
        |--------------------------------------------------------------------------
        */

        $transaction = Transaction::create([
            'user_id' => $user->id,
            'type' => $validated['type'],
            'category' => $validated['category'],
            'description' => $validated['description'],
            'amount' => $validated['amount'],
            'transaction_date' => $validated['transaction_date'],
        ]);

        return response()->json([
            'message' => 'Investment transaction created successfully',
            'transaction' => $transaction,
        ], 201);
    }

    public function destroy(Request $request, Transaction $transaction)
    {
        if ($transaction->user_id !== $request->user()->id) {
            return response()->json([
                'message' => 'Unauthorized',
            ], 403);
        }

        $transaction->delete();

        return response()->json([
            'message' => 'Transaction deleted successfully',
        ]);
    }
    public function dashboard(Request $request)
    {
        $userId = $request->user()->id;

        $income = Transaction::where('user_id', $userId)
            ->where('type', 'income')
            ->sum('amount');

        $expense = Transaction::where('user_id', $userId)
            ->where('type', 'expense')
            ->sum('amount');

        $balance = $income - $expense;

        if ($balance > 0) {
            $outlookbalance = "positive";
        } elseif ($balance < 0) {
            $outlookbalance = "negative";
        } else {
            $outlookbalance = "neutral";
        }

        return response()->json([
            'income' => $income,
            'expense' => $expense,
            'balance' => $balance,
            'outlookbalance' => $outlookbalance,
        ]);
    }
}