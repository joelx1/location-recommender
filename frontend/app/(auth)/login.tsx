import { StatusBar } from "expo-status-bar";
import {
  View,
  Text,
  TextInput,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";
import React, { useState } from "react";
const Login = () => {
  //Variables used to hide/show the password
  const [password, setPassword] = useState("");
  const [hidden, setHidden] = useState(true);
  return (
    <ScreenWrapper>
      {/*Container that stores everything except for the sign-up option*/}
      <View style={styles.container}>
        <Text style={styles.title}>Login</Text>

        <View style={styles.form}>
          {/*Input for email*/}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email address"
              keyboardType="email-address"
              placeholderTextColor="#999"
            />
          </View>

          <View style={styles.inputGroup}>

            {/*Input for email*/}
            <Text style={styles.label}>Password</Text>
            {/*Container that allowed the show/hide button to be inside the textbox */}
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.input, styles.passwordInput]}
                value={password}
                onChangeText={setPassword}
                //Hides password input
                secureTextEntry={hidden}
                placeholder="Enter Password"
                placeholderTextColor="#999"
              />
              {/*Shows the button*/}

              <TouchableOpacity
                onPress={() => setHidden(!hidden)}
                style={styles.toggleButton}
              >
                <Text style={styles.toggleText}>
                  {hidden ? "Show" : "Hide"}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>

        {/*When pressed login, the backend isn't connected yet so i just have it set to the profile page*/}
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.push("/profile")}
        >
          <Text style={styles.buttonText}>Log in</Text>
        </TouchableOpacity>
        {/*Animates the status bar when it transitions between light and dark mode */}

        <StatusBar style="auto" animated />

        <View style={styles.footer}>
          {/*Asks the user to sign up if they dont have an account*/}
          <Text style={styles.footerText}>Don&apos;t have an account? </Text>
          <TouchableOpacity onPress={() => router.push("/signup")}>
            <Text style={styles.linkText}>Sign up</Text>
          </TouchableOpacity>
        </View>
      </View>
    </ScreenWrapper>
  );
};

{
  /*Css imported using "Stylesheet"*/
}
const styles = StyleSheet.create({
  //Title
  title: {
    fontSize: 32,
    fontWeight: "bold",
    marginBottom: 32,
    textAlign: "center",
  },
  container: {
    flex: 1,
    justifyContent: "center",
    padding: 24,
  },
  toggleButton: {
    position: "absolute",
    right: 12,
    top: 0,
    bottom: 0,
    minWidth: 44,
    justifyContent: "center",
    alignItems: "center",
  },
  // //styling the show/hide button
  toggleText: {
    color: "black",
    fontWeight: "bold",
  },

  inputGroup: {
    gap: 10,
  },

  label: {
    fontSize: 14,
    color: "black",
  },

  input: {
    borderWidth: 1,
    borderColor: "#e0e0e0",
    borderRadius: 12,
    padding: 16,
    fontSize: 15,
    marginBottom: 16,
  },

  passwordInput: {
    marginBottom: 0,
    paddingRight: 60,
  },

  passwordWrapper: {
    position: "relative",
    justifyContent: "center",
    marginBottom: 16,
  },

  form: {
    width: "100%",
  },

  footer: {
    flexDirection: "row",
    justifyContent: "center",
    marginTop: 24,
  },

  footerText: {
    fontSize: 14,
    color: "#666",
  },

  button: {
    borderRadius: 12,
    backgroundColor: "#000",
    alignItems: "center",
    padding: 16,
  },

  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },

  linkText: {
    fontSize: 14,
    color: "#000",
    fontWeight: "600",
  },
});
export default Login;