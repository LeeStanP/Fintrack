import { router } from "expo-router";
import { useState } from "react";
import {
    Alert,
    KeyboardAvoidingView,
    Platform,
    Pressable,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    View,
} from "react-native";

import { api } from "@/services/api";

const categories = [
  "Food",
  "Transport",
  "Shopping",
  "Bills",
  "Entertainment",
  "Health",
  "Salary",
  "Investment",
  "Other",
];

export default function AddTransaction() {
  const [type, setType] = useState<"expense" | "income">("expense");
  const [amount, setAmount] = useState("");
  const [category, setCategory] = useState("");
  const [description, setDescription] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!amount || !category || !description) {
      Alert.alert(
        "Missing information",
        "Please fill in all fields."
      );
      return;
    }

    const numericAmount = Number(
      amount.replace(/[^0-9]/g, "")
    );

    if (!numericAmount || numericAmount <= 0) {
      Alert.alert("Invalid amount", "Please enter a valid amount.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/transactions", {
        type,
        category,
        description,
        amount: numericAmount,
        transaction_date: new Date()
          .toISOString()
          .split("T")[0],
      });

      console.log("TRANSACTION CREATED:", response.data);

      Alert.alert(
        "Success",
        `${type === "expense" ? "Expense" : "Income"} added successfully.`,
        [
          {
            text: "OK",
            onPress: () => router.back(),
          },
        ]
      );
    } catch (error: any) {
      console.log(
        "TRANSACTION ERROR:",
        error.response?.data ?? error.message
      );

      if (error.response?.status === 401) {
        Alert.alert(
          "Session expired",
          "Please login again."
        );
        return;
      }

      Alert.alert(
        "Error",
        error.response?.data?.message ||
          "Failed to add transaction."
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={
        Platform.OS === "ios" ? "padding" : undefined
      }
    >
      <ScrollView
        contentContainerStyle={styles.content}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.header}>
          <Pressable onPress={() => router.back()}>
            <Text style={styles.back}>‹</Text>
          </Pressable>

          <Text style={styles.title}>
            Add Transaction
          </Text>

          <View style={{ width: 30 }} />
        </View>

        {/* Transaction Type */}

        <Text style={styles.label}>Type</Text>

        <View style={styles.typeContainer}>
          <Pressable
            style={[
              styles.typeButton,
              type === "expense" &&
                styles.expenseSelected,
            ]}
            onPress={() => setType("expense")}
          >
            <Text
              style={[
                styles.typeText,
                type === "expense" &&
                  styles.selectedText,
              ]}
            >
              Expense
            </Text>
          </Pressable>

          <Pressable
            style={[
              styles.typeButton,
              type === "income" &&
                styles.incomeSelected,
            ]}
            onPress={() => setType("income")}
          >
            <Text
              style={[
                styles.typeText,
                type === "income" &&
                  styles.selectedText,
              ]}
            >
              Income
            </Text>
          </Pressable>
        </View>

        {/* Amount */}

        <Text style={styles.label}>Amount</Text>

        <View style={styles.amountContainer}>
          <Text style={styles.currency}>Rp</Text>

          <TextInput
            style={styles.amountInput}
            placeholder="0"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Category */}

        <Text style={styles.label}>Category</Text>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          style={styles.categoryScroll}
        >
          {categories.map((item) => (
            <Pressable
              key={item}
              style={[
                styles.categoryButton,
                category === item &&
                  styles.categorySelected,
              ]}
              onPress={() => setCategory(item)}
            >
              <Text
                style={[
                  styles.categoryText,
                  category === item &&
                    styles.categorySelectedText,
                ]}
              >
                {item}
              </Text>
            </Pressable>
          ))}
        </ScrollView>

        {/* Description */}

        <Text style={styles.label}>Description</Text>

        <TextInput
          style={styles.input}
          placeholder="e.g. Lunch at restaurant"
          value={description}
          onChangeText={setDescription}
          multiline
        />

        {/* Submit */}

        <Pressable
          style={[
            styles.submitButton,
            loading && styles.disabled,
          ]}
          onPress={handleSubmit}
          disabled={loading}
        >
          <Text style={styles.submitText}>
            {loading
              ? "Saving..."
              : `Add ${type === "expense" ? "Expense" : "Income"}`}
          </Text>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },

  content: {
    padding: 24,
    paddingBottom: 40,
  },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 32,
  },

  back: {
    fontSize: 38,
    lineHeight: 38,
  },

  title: {
    fontSize: 24,
    fontWeight: "700",
  },

  label: {
    fontSize: 15,
    fontWeight: "600",
    marginBottom: 10,
    marginTop: 20,
  },

  typeContainer: {
    flexDirection: "row",
    gap: 12,
  },

  typeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
    alignItems: "center",
  },

  expenseSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  incomeSelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  typeText: {
    fontWeight: "600",
  },

  selectedText: {
    color: "#fff",
  },

  amountContainer: {
    flexDirection: "row",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    paddingHorizontal: 16,
  },

  currency: {
    fontSize: 20,
    fontWeight: "600",
    marginRight: 8,
  },

  amountInput: {
    flex: 1,
    fontSize: 28,
    fontWeight: "600",
    paddingVertical: 16,
  },

  categoryScroll: {
    marginHorizontal: -24,
    paddingLeft: 24,
  },

  categoryButton: {
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "#ddd",
    marginRight: 8,
  },

  categorySelected: {
    backgroundColor: "#111",
    borderColor: "#111",
  },

  categoryText: {
    fontSize: 14,
  },

  categorySelectedText: {
    color: "#fff",
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 12,
    padding: 15,
    minHeight: 55,
  },

  submitButton: {
    backgroundColor: "#111",
    padding: 17,
    borderRadius: 12,
    alignItems: "center",
    marginTop: 32,
  },

  submitText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "700",
  },

  disabled: {
    opacity: 0.5,
  },
});