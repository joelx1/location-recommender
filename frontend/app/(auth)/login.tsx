import { StatusBar } from "expo-status-bar";
import { View, Text, Button, TextInput, StyleSheet, TextStyle } from "react-native";
import React from "react";
import ScreenWrapper from "@/components/ScreenWrapper";
import { router } from "expo-router";

const login = () => {
  return (
    <ScreenWrapper>
      <View style={styles.container}>
        <title>Login</title>
        <h1 >Login</h1>
        
          <Text style={styles.text}>Email</Text>
        <TextInput style={styles.input}
          placeholder="Enter email address:"
          keyboardType="email-address">
        </TextInput>
        
        <Text style={styles.text}>Password</Text>
        <TextInput style={styles.input}
          placeholder="Enter password">
        </TextInput>
        <br></br>
        <br></br>
        <Button title="Login" onPress={() => router.push("/profile")} />
        <StatusBar style="auto" />
      </View>
    </ScreenWrapper>
  );
};

const styles=StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    alignItems: 'center',
  },
  input: {
    borderWidth: 2,
    borderRadius: 8,
    fontSize: 18,
    height: 40,
    width: 500,
    boxSizing: "border-box",
    
  },
  text: {
    width: 500,
    textAlign: 'left',
  }
});


export default login;
