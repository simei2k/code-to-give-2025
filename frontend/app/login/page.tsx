"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { signInWithEmailAndPassword, createUserWithEmailAndPassword, updateProfile } from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { GlassCard, StyledContainer } from "../donate/page";

export default function LoginPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    displayName: "",
    confirmPassword: ""
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const router = useRouter();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });

    if (error) setError("");
    if (success) setSuccess("");
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError("Email and password are required");
      return false;
    }

    // Email format validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError("Please enter a valid email address");
      return false;
    }

    if (!isLogin) {
      if (!formData.displayName?.trim()) {
        setError("Display name is required for signup");
        return false;
      }
      
      if (formData.displayName.trim().length < 2) {
        setError("Display name must be at least 2 characters long");
        return false;
      }

      if (formData.password.length < 6) {
        setError("Password must be at least 6 characters long");
        return false;
      }

      if (formData.password !== formData.confirmPassword) {
        setError("Passwords do not match");
        return false;
      }
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError("");
    setSuccess("");

    try {
      if (isLogin) {
        const userCredential = await signInWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        const user = userCredential.user;
        const token = await user.getIdToken();

        setSuccess("Login successful! Redirecting shortly...");
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          token
        };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User logged in:", userData);

      } else {
        const userCredential = await createUserWithEmailAndPassword(
          auth,
          formData.email.trim(),
          formData.password
        );
        const user = userCredential.user;

        if (formData.displayName.trim()) {
          await updateProfile(user, { displayName: formData.displayName.trim() });
        }

        const token = await user.getIdToken();

        // Create donor record in Firestore
        try {
          const donorData = {
            displayName: formData.displayName.trim(),
            email: user.email,
            totalDonated: 0,
            badges: [],
            createdAt: new Date(),
            donorId: user.uid
          };
          
          // Add to donors collection
          const { doc, setDoc } = await import("firebase/firestore");
          await setDoc(doc(db, "donors", user.uid), donorData);
          console.log("Donor record created:", donorData);
        } catch (donorError) {
          console.error("Failed to create donor record:", donorError);
          // Don't fail the signup if donor record creation fails
        }

        setSuccess("Account created successfully!");
        const userData = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          token
        };
        localStorage.setItem("user", JSON.stringify(userData));
        console.log("User signed up:", userData);
      }

      // redirect to donor-home after short delay
      setTimeout(() => {
        router.push("/donor-home");
      }, 1000);
    } catch (err: any) {
      let errorMessage = err.message || "An error occurred";
      if (err.code === "auth/user-not-found" || err.code === "auth/wrong-password" || err.code === "auth/invalid-credential") {
        errorMessage = "Invalid email or password.";
      } else if (err.code === "auth/email-already-in-use") {
        errorMessage = "An account with this email already exists.";
      }
      setError(errorMessage);
      console.error("Firebase Auth error:", err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError("");
    setSuccess("");
    setFormData({
      email: "",
      password: "",
      displayName: "",
      confirmPassword: ""
    });
  };

  return (
    <StyledContainer>
      <GlassCard>
        <div 
          className="min-h-screen flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8" 
        >
          <div className="max-w-md w-full space-y-8">
            <div className="text-center">
              {/* Project REACH Logo */}
              <div className="mb-6 flex justify-center">
                <img 
                  src="/reachlogo.png" 
                  alt="Project REACH Logo" 
                  className="w-32 h-32 md:w-40 md:h-40"
                />
              </div>
              
              <h2 className="text-3xl font-bold text-gray-900 mb-2">
                {isLogin ? (
                  <>
                    Welcome to <span style={{ color: '#006e34' }}>REACH</span>
                  </>
                ) : (
                  "Create Your Account"
                )}
              </h2>
              <p className="text-gray-600">
                {isLogin ? "Log in to your account" : "Join our community today!"}
              </p>
            </div>

            <div 
              className="py-8 px-6 shadow-xl rounded-3xl sm:px-10 border relative overflow-hidden"
              style={{
                background: 'rgba(255, 252, 236, 0.95)',
                backdropFilter: 'blur(20px)',
                boxShadow: '0 20px 40px rgba(0, 110, 52, 0.1), 0 0 0 1px rgba(255, 255, 255, 0.2)',
                border: '1px solid rgba(0, 110, 52, 0.1)',
              }}
            >
              {/* Glass effect background overlay */}
              <div 
                className="absolute inset-0 -z-10"
                style={{
                  background: 'linear-gradient(135deg, rgba(255, 252, 236, 0.8) 0%, rgba(245, 242, 220, 0.6) 100%)',
                }}
              />
              
              <form className="space-y-6" onSubmit={handleSubmit} noValidate>
                {!isLogin && (
                  <div>
                    <label htmlFor="displayName" className="block text-sm font-medium text-gray-700 mb-1">
                      Display Name *
                    </label>
                    <input
                      id="displayName"
                      name="displayName"
                      type="text"
                      value={formData.displayName}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 hover:border-gray-400"
                      placeholder="Enter your full name"
                      required={!isLogin}
                    />
                  </div>
                )}

                <div>
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 hover:border-gray-400"
                    placeholder="Enter your email address"
                    required
                  />
                </div>

                <div>
                  <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
                    Password *
                  </label>
                  <input
                    id="password"
                    name="password"
                    type="password"
                    autoComplete={isLogin ? "current-password" : "new-password"}
                    value={formData.password}
                    onChange={handleInputChange}
                    className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 hover:border-gray-400"
                    placeholder={`Enter your password${!isLogin ? " (minimum 6 characters)" : ""}`}
                    required
                  />
                </div>

                {!isLogin && (
                  <div>
                    <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
                      Confirm Password *
                    </label>
                    <input
                      id="confirmPassword"
                      name="confirmPassword"
                      type="password"
                      autoComplete="new-password"
                      value={formData.confirmPassword}
                      onChange={handleInputChange}
                      className="appearance-none block w-full px-4 py-3 border border-gray-300 rounded-md shadow-sm placeholder-gray-400 text-gray-900 focus:outline-none focus:ring-2 focus:ring-green-600 focus:border-green-600 transition-all duration-200 hover:border-gray-400"
                      placeholder="Confirm your password"
                      required={!isLogin}
                    />
                  </div>
                )}

                {error && (
                  <div className="bg-red-50 border border-red-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-red-800">{error}</p>
                      </div>
                    </div>
                  </div>
                )}

                {success && (
                  <div className="bg-green-50 border border-green-200 rounded-md p-4">
                    <div className="flex">
                      <div className="flex-shrink-0">
                        <svg className="h-5 w-5 text-green-400" viewBox="0 0 20 20" fill="currentColor">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <div className="ml-3">
                        <p className="text-sm text-green-800">{success}</p>
                      </div>
                    </div>
                  </div>
                )}

                <div>
                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-700 hover:bg-green-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 transform hover:scale-[1.02] disabled:transform-none"
                  >
                    {loading ? (
                      <div className="flex items-center">
                        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                        {isLogin ? "Signing in..." : "Creating account..."}
                      </div>
                    ) : (
                      <span>{isLogin ? "Log In" : "Create Account"}</span>
                    )}
                  </button>
                </div>
              </form>

              <div className="mt-6">
                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-gray-300" />
                  </div>
                  <div className="relative flex justify-center text-sm">
                    <span 
                      className="px-2 text-gray-600 font-medium"
                      style={{
                        background: 'rgba(255, 252, 236, 0.95)',
                      }}
                    >
                      {isLogin ? "Don't have an account?" : "Already have an account?"}
                    </span>
                  </div>
                </div>

                <div className="mt-6">
                  <button
                    type="button"
                    onClick={toggleMode}
                    disabled={loading}
                    className="w-full flex justify-center py-2 px-4 border border-green-600 rounded-md shadow-sm text-sm font-medium text-green-700 bg-white hover:bg-green-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-600 transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isLogin ? "Create an account" : "Log in instead"}
                  </button>
                </div>
              </div>

              <div className="mt-6 text-center">
                <p className="text-xs text-gray-500">
                  By {isLogin ? "signing in" : "creating an account"}, you agree to our{" "}
                  <a href="#" className="text-green-600 hover:text-green-500">Terms of Service</a>{" "}
                  and <a href="#" className="text-green-600 hover:text-green-500">Privacy Policy</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </GlassCard>
    </StyledContainer>
  );
}
  