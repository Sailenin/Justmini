import React from "react";
import { Link } from "react-router-dom";
import "../styles/Navbar.css";

export default function Navbar() {
  return (
    <nav className="navbar">
      <div>
      <h2 className="logo">Healing Hearts💕</h2>
      <p>Providing Hope through Blood & Organ Donation</p>
      </div>
      <div className="links">
        <Link to="/" className="nav-link">Home</Link>
        <Link to="/login" className="nav-link">Login</Link>
        <Link to="/about" className="nav-link">About Us</Link>
        <Link to="/contact" className="nav-link">Contact Us</Link>  
      </div>
    </nav>
  );
}
