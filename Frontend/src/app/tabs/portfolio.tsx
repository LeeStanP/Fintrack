import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import axios from "axios";
import { api } from "../../services/api";

interface PortfolioSummary {
  total_invested: number;
  total_value: number;
  profit_loss: number;
  return_percentage: number;
  outlook: "positive" | "negative" | "neutral";
}

interface Investment {
  id: number;
  user_id: number;
  symbol: string;
  name: string;
  type: string;
  quantity: number | string;
  average_buy_price: number | string;
  current_price: number | string;
  created_at?: string;
  updated_at?: string;
}

type TradeMode = "buy" | "sell" | null;

export default function Portfolio() {
  const [summary, setSummary] =
    useState<PortfolioSummary | null>(null);

  const [investments, setInvestments] =
    useState<Investment[]>([]);

  const [loading, setLoading] = useState(true);

  // Buy / Sell
  const [tradeMode, setTradeMode] =
    useState<TradeMode>(null);

  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");

  const [submitting, setSubmitting] =
    useState(false);

  const loadPortfolio = async () => {
    try {
      console.log("Loading portfolio...");

      const [
        summaryResponse,
        portfolioResponse,
      ] = await Promise.all([
        api.get("/portfolio/summary"),
        api.get("/portfolio"),
      ]);

      console.log(
        "SUMMARY:",
        summaryResponse.data
      );

      console.log(
        "INVESTMENTS:",
        portfolioResponse.data
      );

      setSummary(summaryResponse.data);

      setInvestments(
        portfolioResponse.data.investments
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "PORTFOLIO ERROR:",
          error.response?.data ||
            error.message
        );
      } else {
        console.log(
          "PORTFOLIO ERROR:",
          error
        );
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPortfolio();
  }, []);

  const openBuy = () => {
    setTradeMode("buy");
    setQuantity("");
    setPrice("");
  };

  const openSell = () => {
    setTradeMode("sell");
    setQuantity("");
    setPrice("");
  };

  const closeTrade = () => {
    setTradeMode(null);
    setQuantity("");
    setPrice("");
  };

  const numericQuantity =
    Number(quantity) || 0;

  const numericPrice =
    Number(price) || 0;

  const total =
    numericQuantity * numericPrice;

  const bbcaInvestment = investments.find(
    (investment) =>
      investment.symbol === "BBCA"
  );

  const ownedShares = bbcaInvestment
    ? Number(bbcaInvestment.quantity)
    : 0;

  const handleTrade = async () => {
    if (!tradeMode) {
      return;
    }

    if (
      numericQuantity <= 0 ||
      numericPrice <= 0
    ) {
      Alert.alert(
        "Invalid Input",
        "Please enter a valid quantity and price."
      );

      return;
    }

    if (
      tradeMode === "sell" &&
      numericQuantity > ownedShares
    ) {
      Alert.alert(
        "Not Enough Shares",
        `You only own ${ownedShares} BBCA shares.`
      );

      return;
    }

    try {
      setSubmitting(true);

      const endpoint =
        tradeMode === "buy"
          ? "/portfolio/buy"
          : "/portfolio/sell";

      const payload =
        tradeMode === "buy"
          ? {
              symbol: "BBCA",
              name: "Bank Central Asia",
              quantity: numericQuantity,
              price: numericPrice,
            }
          : {
              symbol: "BBCA",
              quantity: numericQuantity,
              price: numericPrice,
            };

      const response = await api.post(
        endpoint,
        payload
      );

      console.log(
        "TRADE RESPONSE:",
        response.data
      );

      Alert.alert(
        "Success",
        tradeMode === "buy"
          ? `Bought ${numericQuantity} BBCA shares.`
          : `Sold ${numericQuantity} BBCA shares.`
      );

      closeTrade();

      // Refresh portfolio
      await loadPortfolio();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "TRADE ERROR:",
          error.response?.data ||
            error.message
        );

        const message =
          error.response?.data?.message ||
          "Transaction failed.";

        Alert.alert(
          "Transaction Failed",
          message
        );
      } else {
        console.log(
          "TRADE ERROR:",
          error
        );

        Alert.alert(
          "Transaction Failed",
          "Something went wrong."
        );
      }
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />

        <Text style={styles.loadingText}>
          Loading portfolio...
        </Text>
      </View>
    );
  }

  if (!summary) {
    return (
      <View style={styles.loading}>
        <Text>
          Unable to load portfolio.
        </Text>
      </View>
    );
  }

  const outlookColor =
    summary.outlook === "positive"
      ? "#22c55e"
      : summary.outlook === "negative"
      ? "#ef4444"
      : "#64748B";

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={{
        paddingBottom: 40,
      }}
    >
      <Text style={styles.title}>
        Portfolio
      </Text>

      {/* BUY / SELL BUTTONS */}

      <View style={styles.tradeButtons}>
        <TouchableOpacity
          style={[
            styles.tradeButton,
            styles.buyButton,
          ]}
          onPress={openBuy}
          disabled={submitting}
        >
          <Text style={styles.buyButtonText}>
            + Buy
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.tradeButton,
            styles.sellButton,
          ]}
          onPress={openSell}
          disabled={submitting}
        >
          <Text style={styles.sellButtonText}>
            − Sell
          </Text>
        </TouchableOpacity>
      </View>

      {/* BUY / SELL FORM */}

      {tradeMode && (
        <View style={styles.tradeCard}>
          <View style={styles.tradeHeader}>
            <Text style={styles.tradeTitle}>
              {tradeMode === "buy"
                ? "Buy Investment"
                : "Sell Investment"}
            </Text>

            <TouchableOpacity
              onPress={closeTrade}
            >
              <Text style={styles.closeButton}>
                ×
              </Text>
            </TouchableOpacity>
          </View>

          {/* STOCK */}

          <Text style={styles.inputLabel}>
            Investment
          </Text>

          <View style={styles.stockBox}>
            <View>
              <Text style={styles.stockSymbol}>
                BBCA
              </Text>

              <Text style={styles.stockName}>
                Bank Central Asia
              </Text>
            </View>

            <Text style={styles.stockType}>
              STOCK
            </Text>
          </View>

          {/* OWNED SHARES FOR SELL */}

          {tradeMode === "sell" && (
            <Text style={styles.ownedText}>
              You own {ownedShares} BBCA shares
            </Text>
          )}

          {/* QUANTITY */}

          <Text style={styles.inputLabel}>
            Shares
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter number of shares"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={quantity}
            onChangeText={setQuantity}
          />

          {/* PRICE */}

          <Text style={styles.inputLabel}>
            Price per share
          </Text>

          <TextInput
            style={styles.input}
            placeholder="Enter price"
            placeholderTextColor="#999"
            keyboardType="decimal-pad"
            value={price}
            onChangeText={setPrice}
          />

          {/* TOTAL */}

          <View style={styles.totalBox}>
            <Text style={styles.totalLabel}>
              Total
            </Text>

            <Text style={styles.totalAmount}>
              Rp{" "}
              {total.toLocaleString(
                "id-ID"
              )}
            </Text>
          </View>

          {/* SUBMIT */}

          <TouchableOpacity
            style={[
              styles.submitButton,
              tradeMode === "buy"
                ? styles.submitBuy
                : styles.submitSell,
            ]}
            onPress={handleTrade}
            disabled={submitting}
          >
            {submitting ? (
              <ActivityIndicator
                color="white"
              />
            ) : (
              <Text
                style={
                  styles.submitButtonText
                }
              >
                {tradeMode === "buy"
                  ? "Buy BBCA"
                  : "Sell BBCA"}
              </Text>
            )}
          </TouchableOpacity>
        </View>
      )}

      {/* SUMMARY */}

      <View style={styles.summaryCard}>
        <Text style={styles.summaryLabel}>
          Total Portfolio Value
        </Text>

        <Text style={styles.totalValue}>
          Rp{" "}
          {Number(
            summary.total_value
          ).toLocaleString("id-ID")}
        </Text>

        <View style={styles.summaryRow}>
          <View>
            <Text style={styles.summaryLabel}>
              Invested
            </Text>

            <Text style={styles.summaryValue}>
              Rp{" "}
              {Number(
                summary.total_invested
              ).toLocaleString(
                "id-ID"
              )}
            </Text>
          </View>

          <View>
            <Text style={styles.summaryLabel}>
              Profit / Loss
            </Text>

            <Text
              style={[
                styles.summaryValue,
                {
                  color: outlookColor,
                },
              ]}
            >
              {summary.profit_loss >= 0
                ? "+"
                : "-"}
              Rp{" "}
              {Math.abs(
                Number(
                  summary.profit_loss
                )
              ).toLocaleString(
                "id-ID"
              )}
            </Text>
          </View>
        </View>

        <Text
          style={[
            styles.returnPercentage,
            {
              color: outlookColor,
            },
          ]}
        >
          {summary.return_percentage >= 0
            ? "+"
            : ""}
          {summary.return_percentage}%
        </Text>
      </View>

      {/* INVESTMENTS */}

      <Text style={styles.sectionTitle}>
        Your Investments
      </Text>

      {investments.length === 0 ? (
        <View style={styles.emptyCard}>
          <Text style={styles.emptyTitle}>
            No investments yet
          </Text>

          <Text style={styles.emptyText}>
            Start building your portfolio
            by buying an investment.
          </Text>
        </View>
      ) : (
        investments.map((investment) => {
          const quantity =
            Number(
              investment.quantity
            );

          const averageBuyPrice =
            Number(
              investment.average_buy_price
            );

          const currentPrice =
            Number(
              investment.current_price
            );

          const invested =
            quantity *
            averageBuyPrice;

          const currentValue =
            quantity *
            currentPrice;

          const profitLoss =
            currentValue -
            invested;

          const percentage =
            invested > 0
              ? (profitLoss /
                  invested) *
                100
              : 0;

          const investmentColor =
            profitLoss > 0
              ? "#22c55e"
              : profitLoss < 0
              ? "#ef4444"
              : "#64748B";

          return (
            <View
              key={investment.id}
              style={styles.card}
            >
              <View
                style={
                  styles.headerRow
                }
              >
                <View>
                  <Text
                    style={
                      styles.symbol
                    }
                  >
                    {
                      investment.symbol
                    }
                  </Text>

                  <Text
                    style={styles.name}
                  >
                    {investment.name}
                  </Text>
                </View>

                <Text
                  style={[
                    styles.profit,
                    {
                      color:
                        investmentColor,
                    },
                  ]}
                >
                  {percentage >= 0
                    ? "+"
                    : ""}
                  {percentage.toFixed(
                    2
                  )}
                  %
                </Text>
              </View>

              <View
                style={styles.divider}
              />

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.label}
                >
                  Shares
                </Text>

                <Text
                  style={styles.value}
                >
                  {quantity}
                </Text>
              </View>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.label}
                >
                  Average Buy Price
                </Text>

                <Text
                  style={styles.value}
                >
                  Rp{" "}
                  {averageBuyPrice.toLocaleString(
                    "id-ID"
                  )}
                </Text>
              </View>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.label}
                >
                  Current Price
                </Text>

                <Text
                  style={styles.value}
                >
                  Rp{" "}
                  {currentPrice.toLocaleString(
                    "id-ID"
                  )}
                </Text>
              </View>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.label}
                >
                  Current Value
                </Text>

                <Text
                  style={styles.value}
                >
                  Rp{" "}
                  {currentValue.toLocaleString(
                    "id-ID"
                  )}
                </Text>
              </View>

              <View
                style={styles.infoRow}
              >
                <Text
                  style={styles.label}
                >
                  Profit / Loss
                </Text>

                <Text
                  style={[
                    styles.value,
                    {
                      color:
                        investmentColor,
                    },
                  ]}
                >
                  {profitLoss >= 0
                    ? "+"
                    : "-"}
                  Rp{" "}
                  {Math.abs(
                    profitLoss
                  ).toLocaleString(
                    "id-ID"
                  )}
                </Text>
              </View>
            </View>
          );
        })
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f5f5f5",
    padding: 24,
  },

  loading: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },

  loadingText: {
    marginTop: 10,
    color: "#777",
  },

  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginTop: 30,
    marginBottom: 20,
  },

  // =========================
  // BUY / SELL
  // =========================

  tradeButtons: {
    flexDirection: "row",
    gap: 12,
    marginBottom: 20,
  },

  tradeButton: {
    flex: 1,
    padding: 15,
    borderRadius: 12,
    alignItems: "center",
  },

  buyButton: {
    backgroundColor: "#22c55e",
  },

  sellButton: {
    backgroundColor: "#ef4444",
  },

  buyButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  sellButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // =========================
  // TRADE FORM
  // =========================

  tradeCard: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 16,
    marginBottom: 20,
  },

  tradeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 20,
  },

  tradeTitle: {
    fontSize: 20,
    fontWeight: "bold",
  },

  closeButton: {
    fontSize: 28,
    color: "#777",
  },

  inputLabel: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
    marginTop: 12,
  },

  stockBox: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  stockSymbol: {
    fontSize: 18,
    fontWeight: "bold",
  },

  stockName: {
    color: "#777",
    marginTop: 3,
  },

  stockType: {
    fontSize: 11,
    fontWeight: "bold",
    color: "#64748B",
  },

  ownedText: {
    marginTop: 8,
    color: "#64748B",
    fontSize: 13,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    backgroundColor: "#fafafa",
  },

  totalBox: {
    marginTop: 20,
    padding: 16,
    borderRadius: 10,
    backgroundColor: "#f5f5f5",
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  totalLabel: {
    color: "#777",
    fontSize: 14,
  },

  totalAmount: {
    fontSize: 18,
    fontWeight: "bold",
  },

  submitButton: {
    marginTop: 15,
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },

  submitBuy: {
    backgroundColor: "#22c55e",
  },

  submitSell: {
    backgroundColor: "#ef4444",
  },

  submitButtonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  // =========================
  // SUMMARY
  // =========================

  summaryCard: {
    backgroundColor: "#111",
    padding: 22,
    borderRadius: 16,
    marginBottom: 25,
  },

  summaryLabel: {
    color: "#888",
    fontSize: 13,
    marginBottom: 5,
  },

  totalValue: {
    color: "white",
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 20,
  },

  summaryRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },

  summaryValue: {
    fontSize: 15,
    fontWeight: "bold",
    color: "white",
  },

  returnPercentage: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 18,
  },

  // =========================
  // INVESTMENTS
  // =========================

  sectionTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 12,
  },

  card: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 14,
    marginBottom: 12,
  },

  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },

  symbol: {
    fontSize: 21,
    fontWeight: "bold",
  },

  name: {
    color: "#777",
    marginTop: 3,
  },

  profit: {
    fontSize: 16,
    fontWeight: "bold",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 15,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 10,
  },

  label: {
    color: "#777",
  },

  value: {
    fontWeight: "bold",
  },

  emptyCard: {
    backgroundColor: "white",
    padding: 25,
    borderRadius: 14,
    alignItems: "center",
  },

  emptyTitle: {
    fontSize: 17,
    fontWeight: "bold",
  },

  emptyText: {
    color: "#777",
    textAlign: "center",
    marginTop: 8,
  },
});