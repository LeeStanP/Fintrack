import { useState } from "react";
import {
    ActivityIndicator,
    Alert,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";

import axios from "axios";
import { router } from "expo-router";
import { api } from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");

  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!name || !email || !password || !passwordConfirmation) {
      Alert.alert(
        "Missing Information",
        "Please fill in all fields."
      );

      return;
    }

    if (password !== passwordConfirmation) {
      Alert.alert(
        "Password Mismatch",
        "Password and confirmation do not match."
      );

      return;
    }

    if (password.length < 8) {
      Alert.alert(
        "Invalid Password",
        "Password must be at least 8 characters."
      );

      return;
    }

    try {
      setLoading(true);

      const response = await api.post("/register", {
        name,
        email,
        password,
        password_confirmation: passwordConfirmation,
      });

      console.log(
        "REGISTER RESPONSE:",
        response.data
      );

      // Registration only creates the account.
      // The user must login separately.
      Alert.alert(
        "Registration Successful",
        "Your account has been created. Please login to continue.",
        [
          {
            text: "Login",
            onPress: () => {
              router.replace("/login");
            },
          },
        ]
      );
    } catch (error) {
      if (axios.isAxiosError(error)) {
        console.log(
          "REGISTER ERROR:",
          error.response?.data ||
            error.message
        );

        const message =
          error.response?.data?.message ||
          "Registration failed.";

        Alert.alert(
          "Registration Failed",
          message
        );
      } else {
        console.log(
          "REGISTER ERROR:",
          error
        );

        Alert.alert(
          "Registration Failed",
          "Something went wrong."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>
        Create Account
      </Text>

      <Text style={styles.subtitle}>
        Start managing your money with FinTrack.
      </Text>

      {/* NAME */}

      <Text style={styles.label}>
        Name
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your name"
        placeholderTextColor="#999"
        value={name}
        onChangeText={setName}
      />

      {/* EMAIL */}

      <Text style={styles.label}>
        Email
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Enter your email"
        placeholderTextColor="#999"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        autoCorrect={false}
      />

      {/* PASSWORD */}

      <Text style={styles.label}>
        Password
      </Text>

      <TextInput
        style={styles.input}
        placeholder="Create a password"
        placeholderTextColor="#999"
        value={password}
        onChangeText={setPassword}
        secureTextEntry
      />

      <Text style={styles.label}>
        Password Confirmation
      </Text>

      <TextInput
        style={styles.input}
        placeholder="re-enter your password"
        placeholderTextColor="#999"
        value={passwordConfirmation}
        onChangeText={setPasswordConfirmation}
        secureTextEntry
      />

      {/* REGISTER BUTTON */}

      <TouchableOpacity
        style={[
          styles.button,
          loading && styles.buttonDisabled,
        ]}
        onPress={handleRegister}
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="white" />
        ) : (
          <Text style={styles.buttonText}>
            Create Account
          </Text>
        )}
      </TouchableOpacity>

      {/* LOGIN */}

      <View style={styles.loginContainer}>
        <Text style={styles.loginText}>
          Already have an account?
        </Text>

        <TouchableOpacity
          onPress={() => router.replace("/login")}
        >
          <Text style={styles.loginLink}>
            Login
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
    backgroundColor: "#f5f5f5",
  },

  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 8,
  },

  subtitle: {
    color: "#777",
    fontSize: 15,
    marginBottom: 30,
  },

  label: {
    fontSize: 14,
    fontWeight: "600",
    marginBottom: 8,
  },

  input: {
    backgroundColor: "white",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 10,
    padding: 14,
    fontSize: 16,
    marginBottom: 18,
  },

  button: {
    backgroundColor: "#111",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 5,
  },

  buttonDisabled: {
    opacity: 0.5,
  },

  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },

  loginContainer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 25,
    gap: 5,
  },

  loginText: {
    color: "#777",
  },

  loginLink: {
    fontWeight: "bold",
    color: "#111",
  },
});
