import { router, useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    FlatList,
    Pressable,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { api } from "@/services/api";

type Transaction = {
  id: number;
  type: "income" | "expense";
  category: string;
  description: string;
  amount: string | number;
  transaction_date: string;
};

export default function Transactions() {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchTransactions = async () => {
    try {
      setLoading(true);

      const response = await api.get("/transactions");

      setTransactions(response.data.transactions);
    } catch (error: any) {
      console.log(
        "TRANSACTIONS ERROR:",
        error.response?.data ?? error.message
      );
    } finally {
      setLoading(false);
    }
  };

  // Refresh whenever we come back to this screen
  useFocusEffect(
    useCallback(() => {
      fetchTransactions();
    }, [])
  );

  const formatAmount = (amount: string | number) => {
    return Number(amount).toLocaleString("id-ID");
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Transactions
      </Text>

      {/* Add Transaction Button */}

      <Pressable
        style={styles.addButton}
        onPress={() => router.push("/add-transaction")}
      >
        <Text style={styles.addButtonText}>
          + Add Transaction
        </Text>
      </Pressable>

      {/* Loading */}

      {loading ? (
        <ActivityIndicator
          size="large"
          style={styles.loading}
        />
      ) : transactions.length === 0 ? (
        <View style={styles.empty}>
          <Text style={styles.emptyTitle}>
            No transactions yet
          </Text>

          <Text style={styles.emptyText}>
            Add your first income or expense.
          </Text>
        </View>
      ) : (
        <FlatList
          data={transactions}
          keyExtractor={(item) => item.id.toString()}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <View style={styles.transaction}>
              <View style={styles.transactionInfo}>
                <Text style={styles.description}>
                  {item.description}
                </Text>

                <Text style={styles.category}>
                  {item.category}
                </Text>

                <Text style={styles.date}>
                  {item.transaction_date}
                </Text>
              </View>

              <Text
                style={
                  item.type === "income"
                    ? styles.income
                    : styles.expense
                }
              >
                {item.type === "income" ? "+" : "-"} Rp{" "}
                {formatAmount(item.amount)}
              </Text>
            </View>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
  },

  addButton: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    marginBottom: 20,
  },

  addButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  loading: {
    marginTop: 40,
  },

  transaction: {
    backgroundColor: "white",
    padding: 18,
    borderRadius: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  transactionInfo: {
    flex: 1,
    marginRight: 10,
  },

  description: {
    fontSize: 16,
    fontWeight: "bold",
  },

  category: {
    color: "#777",
    marginTop: 4,
  },

  date: {
    color: "#aaa",
    marginTop: 4,
    fontSize: 12,
  },

  income: {
    fontWeight: "bold",
    fontSize: 15,
  },

  expense: {
    fontWeight: "bold",
    fontSize: 15,
  },

  empty: {
    alignItems: "center",
    marginTop: 80,
  },

  emptyTitle: {
    fontSize: 18,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#777",
    marginTop: 8,
  },
});