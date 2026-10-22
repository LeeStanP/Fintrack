import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { useState } from "react";
import {
  Alert,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import { api } from "@/services/api";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Error", "Please enter your email and password.");
      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/login", {
        email,
        password,
      });

      const { token, user } = response.data;

      // Save token for future API requests
      await AsyncStorage.setItem("auth_token", token);

      // Save user information
      await AsyncStorage.setItem("user", JSON.stringify(user));

      console.log("LOGIN SUCCESS:", user);

      // Go to the main application
      router.replace("/tabs");
    } catch (error: any) {
      console.log(
        "LOGIN ERROR:",
        error.response?.data ?? error.message
      );

      const message =
        error.response?.data?.message ||
        "Unable to login. Please check your credentials.";

      Alert.alert("Login Failed", message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>FinTrack</Text>

      <Text style={styles.subtitle}>
        Manage your money. Track your investments.
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />

      <TextInput
        style={styles.input}
        placeholder="Password"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <TouchableOpacity
        style={[styles.button, loading && styles.buttonDisabled]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>
      <View style={styles.registerContainer}>
        <Text style={styles.registerText}>
          Don't have an account?
        </Text>

        <TouchableOpacity
          onPress={() => router.push("/register")}
        >
          <Text style={styles.registerLink}>
            Register
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },

  title: {
    fontSize: 36,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    fontSize: 16,
    marginBottom: 32,
  },

  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    marginBottom: 16,
  },

  button: {
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    backgroundColor: "#111",
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "white",
    fontWeight: "bold",
  },
  registerContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },

  registerText: {
    color: "#777",
  },

  registerLink: {
    fontWeight: "bold",
    color: "#111",
  },
  });