import React from "react";
import { Link } from "react-router-dom";

// Add some inline styles for hover effects
const styles = `
  .hover-card {
    transition: transform 0.2s ease-in-out;
  }
  .hover-card:hover {
    transform: translateY(-5px);
    box-shadow: 0 8px 25px rgba(0,0,0,0.15) !important;
  }
`;

function HomePage() {
  return (
    <>
      <style>{styles}</style>
      <div className="container-fluid vh-100 d-flex align-items-center justify-content-center" style={{ backgroundColor: "#f8f9fa" }}>
      <div className="text-center">
        <div className="mb-5">
          <h1 className="display-4 fw-bold text-primary mb-3">
            <i className="fas fa-shopping-cart me-3"></i>
            eBay Clone
          </h1>
          <p className="lead text-muted">
            Welcome to your marketplace - Buy, Sell, Discover
          </p>
        </div>

        <div className="row g-3 justify-content-center">
          <div className="col-md-6 col-lg-3">
            <Link to="/login" className="btn btn-primary btn-lg w-100 py-3 shadow-sm">
              <i className="fas fa-sign-in-alt me-2"></i>
              Login
            </Link>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <Link to="/register" className="btn btn-success btn-lg w-100 py-3 shadow-sm">
              <i className="fas fa-user-plus me-2"></i>
              Register
            </Link>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <Link to="/profile" className="btn btn-info btn-lg w-100 py-3 shadow-sm">
              <i className="fas fa-user me-2"></i>
              Profile
            </Link>
          </div>
          
          <div className="col-md-6 col-lg-3">
            <Link to="/verify-pin" className="btn btn-warning btn-lg w-100 py-3 shadow-sm">
              <i className="fas fa-key me-2"></i>
              Verify PIN
            </Link>
          </div>
        </div>

        <div className="mt-5">
          <div className="row text-center">
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="fas fa-shopping-bag fa-3x text-primary mb-3"></i>
                  <h5 className="card-title">Shop</h5>
                  <p className="card-text text-muted">
                    Discover millions of products from trusted sellers
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="fas fa-store fa-3x text-success mb-3"></i>
                  <h5 className="card-title">Sell</h5>
                  <p className="card-text text-muted">
                    Start your business and reach millions of buyers
                  </p>
                </div>
              </div>
            </div>
            
            <div className="col-md-4">
              <div className="card border-0 shadow-sm h-100">
                <div className="card-body">
                  <i className="fas fa-gavel fa-3x text-warning mb-3"></i>
                  <h5 className="card-title">Auction</h5>
                  <p className="card-text text-muted">
                    Bid on unique items and find great deals
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-center mb-4 text-secondary">Order Management</h3>
          <div className="row justify-content-center">
            <div className="col-md-6 col-lg-4">
              <Link to="/order-history" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center">
                    <i className="fas fa-history fa-3x text-info mb-3"></i>
                    <h5 className="card-title">Order History</h5>
                    <p className="card-text text-muted">
                      View and track all your orders
                    </p>
                  </div>
                </div>
              </Link>
            </div>
            
            <div className="col-md-6 col-lg-4">
              <Link to="/return-requests" className="text-decoration-none">
                <div className="card border-0 shadow-sm h-100 hover-card">
                  <div className="card-body text-center">
                    <i className="fas fa-undo-alt fa-3x text-danger mb-3"></i>
                    <h5 className="card-title">Return Requests</h5>
                    <p className="card-text text-muted">
                      Manage your product return requests
                    </p>
                  </div>
                </div>
              </Link>
            </div>
          </div>
        </div>

        <footer className="mt-5 pt-4 border-top">
          <p className="text-muted">
            &copy; 2024 eBay Clone. Built with React & Node.js
          </p>
        </footer>
      </div>
    </div>
    </>
  );
}

export default HomePage;
