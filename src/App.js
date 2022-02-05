import React, { useState } from 'react';
import { BrowserRouter as Router, Route, Link } from "react-router-dom";
import logo from './logo.svg';
import './App.css';
import { UserProvider } from "./UserContext";

import HomePage from './HomePage';

function App() {
  return (
    <React.StrictMode>
      <Router>
        <UserProvider value={{name: "Ryan", Auth: false}}>
          <Route path="/" exact component={HomePage} />
        </UserProvider>
      </Router>
    </React.StrictMode>
  );
}

export default App;
