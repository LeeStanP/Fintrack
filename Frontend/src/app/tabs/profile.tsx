import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    StyleSheet,
    Text,
    View,
} from "react-native";

import { api } from "../../services/api";

interface User {
  id: number;
  name: string;
  email: string;
  created_at?: string;
}

export default function Profile() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const loadProfile = async () => {
    try {
      const response = await api.get("/me");

      console.log("PROFILE:", response.data);

      setUser(response.data);
    } catch (error: any) {
      console.log(
        "PROFILE ERROR:",
        error.response?.data || error.message
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfile();
  }, []);

  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" />
        <Text style={styles.loadingText}>
          Loading profile...
        </Text>
      </View>
    );
  }

  if (!user) {
    return (
      <View style={styles.loading}>
        <Text>Unable to load profile.</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Profile</Text>

      <View style={styles.card}>
        <Text style={styles.label}>Name</Text>

        <Text style={styles.name}>
          {user.name}
        </Text>

        <View style={styles.divider} />

        <Text style={styles.label}>Email</Text>

        <Text style={styles.email}>
          {user.email}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    backgroundColor: "#f5f5f5",
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
    marginBottom: 30,
  },

  card: {
    backgroundColor: "white",
    padding: 22,
    borderRadius: 16,
  },

  label: {
    color: "#777",
    fontSize: 13,
    marginBottom: 6,
  },

  name: {
    fontSize: 22,
    fontWeight: "bold",
  },

  email: {
    fontSize: 16,
    color: "#333",
  },

  divider: {
    height: 1,
    backgroundColor: "#eee",
    marginVertical: 20,
  },
});
