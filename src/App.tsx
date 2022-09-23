import React from 'react';
import logo from './logo.svg';
import './App.css';
import Home from './components/Home'
import {BrowserRouter, Routes, Route} from 'react-router-dom'
import {Navbar, Nav } from 'react-bootstrap'
import ThemeProvider from 'react-bootstrap/ThemeProvider'
import About from './components/About'
import CloudFormationToDataDog from "./components/CloudFormationToDataDog"


function App() {
  return (
    <ThemeProvider breakpoints={['xxxl', 'xxl', 'xl', 'lg', 'md']} minBreakpoint="xxs">
    <div className="App">
      <header className="App-header">
        Developer Tools
        <Navbar>
          <Nav>
            <Nav.Item><Nav.Link href="/">Home</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link href="/cloudformation-to-datadog">CloudFormationToDataDog</Nav.Link></Nav.Item>
            <Nav.Item><Nav.Link href="/about">About</Nav.Link></Nav.Item>
          </Nav>
        </Navbar>
      </header>
      <BrowserRouter>
        <Routes>
          <Route path="" element={<Home />}></Route>
          <Route path="/cloudformation-to-datadog" element={<CloudFormationToDataDog />}></Route>
          <Route path="/about" element={<About />}></Route>

        </Routes>
      </BrowserRouter>
      <footer className="App-footer">Created with Create-React-App</footer>
    </div>
    </ThemeProvider>
  );
}

export default App;
