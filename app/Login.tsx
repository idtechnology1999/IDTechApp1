import React, { useState } from "react";
import {
  View,
  StyleSheet,
  Alert,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
} from "react-native";
import { Text, TextInput, Button } from "react-native-paper";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
// import axios from "axios";
// import { API_URL } from '@env';

export default function Login() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPass, setShowPass] = useState(false);
  // const [message, setmessage] = useState("")

const handleLogin = async () => {

  if (!email.trim() || !password.trim()) {
    return Alert.alert("Error", "Email and password are required.");
  }else{
    
// access the API
// try {
//   const response = await axios.post(`${API_URL}/api/MobileApp/login`);
//   alert(response.data.message)
// } catch (error) {
//   alert("couldn't connect to the API")
//   console.log(error)
//   console.log(`${API_URL}/api/MobileApp/login`)

// }

router.push("/SystemTabs")
  }
};


   
  const handleRegister = () => {
    Alert.alert(
      "Registration",
      "Contact the administrator of IDTECH to create an account."
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1 }}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
    >
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.container}>
          {/* Icon */}
          <View style={styles.iconContainer}>
            <MaterialCommunityIcons
              name="account-lock"
              size={65}
              color="#1A73E8"
            />
          </View>

          {/* Branding */}
          <Text style={styles.title}>IDTECH</Text>
          <Text style={styles.subtitle}>Real World Academy</Text>

          {/* Email */}
          <TextInput
            label="Email"
            value={email}
            mode="outlined"
            onChangeText={setEmail}
            left={<TextInput.Icon icon="email" />}
            style={styles.input}
          />

          {/* Password */}
          <TextInput
            label="Password"
            value={password}
            mode="outlined"
            secureTextEntry={!showPass}
            onChangeText={setPassword}
            style={styles.input}
            left={<TextInput.Icon icon="lock" />}
            right={
              <TextInput.Icon
                icon={showPass ? "eye-off" : "eye"}
                onPress={() => setShowPass(!showPass)}
              />
            }
          />

          {/* Login Button */}
          <Button
            mode="contained"
            onPress={handleLogin}
            style={styles.loginBtn}
            contentStyle={{ paddingVertical: 6 }}
          >
            <Text style={styles.logintext}>Login</Text>
          </Button>

          {/* Register */}
          <TouchableOpacity onPress={handleRegister}>
            <Text style={styles.registerText}>
              Don’t have an account?{" "}
              <Text style={styles.registerBold}>Register</Text>
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingHorizontal: 25,
    justifyContent: "center",
    backgroundColor: "#fff",
    paddingVertical: 50,
  },

  iconContainer: {
    alignItems: "center",
    marginBottom: 15,
  },

  title: {
    fontSize: 40,
    fontWeight: "900",
    textAlign: "center",
    color: "#FF6A00",
  },

  subtitle: {
    fontSize: 20,
    textAlign: "center",
    color: "#1A73E8",
    marginBottom: 35,
    opacity: 0.9,
  },

  input: {
    marginBottom: 15,
  },

  loginBtn: {
    marginTop: 10,
    backgroundColor: "#FF6A00",
    borderRadius: 6,
  },

  registerText: {
    textAlign: "center",
    marginTop: 18,
    fontSize: 15,
    color: "#444",
  },

  registerBold: {
    color: "#1A73E8",
    fontWeight: "700",
  },

  logintext: {
    fontWeight: "600",
    fontSize: 16,
  },
});
