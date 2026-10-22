import { useFocusEffect } from "expo-router";
import { useCallback, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { api } from "@/services/api";

type DashboardData = {
  income: number;
  expense: number;
  balance: number;
  outlookbalance: "positive" | "negative" | "neutral";
};

export default function Home() {
  const [dashboard, setDashboard] =
    useState<DashboardData | null>(null);

  const [loading, setLoading] = useState(true);

  const fetchDashboard = async () => {
    try {
      setLoading(true);

      const response = await api.get("/dashboard");

      console.log("DASHBOARD:", response.data);

      setDashboard(response.data);
    } catch (error: any) {
      console.log(
        "DASHBOARD ERROR:",
        error.response?.data ?? error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchDashboard();
    }, [])
  );

  const formatAmount = (amount: number) => {
    return Number(amount).toLocaleString("id-ID");
  };

  const getBalanceColor = () => {
    if (dashboard?.outlookbalance === "positive") {
      return "#22c55e";
    }

    if (dashboard?.outlookbalance === "negative") {
      return "#ef4444";
    }

    return "#ffffff";
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  if (!dashboard) {
    return (
      <View style={styles.container}>
        <Text style={styles.error}>
          Failed to load dashboard.
        </Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}

      <Text style={styles.greeting}>
        Welcome back 👋
      </Text>

      <Text style={styles.title}>
        FinTrack
      </Text>

      {/* Balance Card */}

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>
          Total Balance
        </Text>

        <Text
          style={[
            styles.balance,
            {
              color: getBalanceColor(),
            },
          ]}
        >
          Rp {formatAmount(dashboard.balance)}
        </Text>
      </View>

      {/* Income / Expense */}

      <View style={styles.summaryContainer}>
        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Income
          </Text>

          <Text style={styles.income}>
            + Rp {formatAmount(dashboard.income)}
          </Text>
        </View>

        <View style={styles.summaryCard}>
          <Text style={styles.summaryLabel}>
            Expenses
          </Text>

          <Text style={styles.expense}>
            - Rp {formatAmount(dashboard.expense)}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
  },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  greeting: {
    fontSize: 16,
    color: "#777",
    marginTop: 30,
  },

  title: {
    fontSize: 30,
    fontWeight: "bold",
    marginTop: 4,
    marginBottom: 24,
  },

  balanceCard: {
    backgroundColor: "#111",
    borderRadius: 18,
    padding: 24,
    marginBottom: 16,
  },

  balanceLabel: {
    color: "#aaa",
    fontSize: 14,
    marginBottom: 10,
  },

  balance: {
    fontSize: 32,
    fontWeight: "bold",
  },

  summaryContainer: {
    flexDirection: "row",
    gap: 12,
  },

  summaryCard: {
    flex: 1,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 18,
  },

  summaryLabel: {
    color: "#777",
    fontSize: 14,
    marginBottom: 8,
  },

  income: {
    color: "#22c55e",
    fontSize: 17,
    fontWeight: "bold",
  },

  expense: {
    color: "#ef4444",
    fontSize: 17,
    fontWeight: "bold",
  },

  error: {
    color: "#ef4444",
    marginTop: 50,
    textAlign: "center",
  },
});