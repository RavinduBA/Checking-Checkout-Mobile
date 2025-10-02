import React, { useState } from "react";
import LoginScreen from "./LoginScreen";
import RegistrationScreen from "./RegistrationScreen";

export default function AuthScreen() {
  const [showLogin, setShowLogin] = useState(true);

  if (showLogin) {
    return <LoginScreen onSwitchToRegister={() => setShowLogin(false)} />;
  }

  return <RegistrationScreen onSwitchToLogin={() => setShowLogin(true)} />;
}
