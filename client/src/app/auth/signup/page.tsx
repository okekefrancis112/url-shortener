"use client";
import React, { useState } from "react";
import Link from "next/link";
import { useAuthStore } from "@/store/authStore";
import { useRouter } from "next/navigation";
import { EyeIcon, EyeSlashIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

type FormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
};

type Errors = {
  name?: string;
  email?: string;
  password?: string;
  confirmPassword?: string;
};

const SignUpPage = () => {
  const [formValues, setFormValues] = useState<FormValues>({
    name: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState<Errors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [serverError, setServerError] = useState("");
  const { signup } = useAuthStore();
  const router = useRouter();

  const validateForm = () => {
    let tempErrors: Errors = {};
    let formIsValid = true;

    // Name validation
    if (!formValues.name.trim()) {
      tempErrors.name = "Please enter your name.";
      formIsValid = false;
    } else if (formValues.name.trim().length < 2) {
      tempErrors.name = "Name should be at least 2 characters.";
      formIsValid = false;
    }

    // Email validation
    if (!formValues.email) {
      tempErrors.email = "Please enter your email address.";
      formIsValid = false;
    } else if (!/\S+@\S+\.\S+/.test(formValues.email)) {
      tempErrors.email = "Email address is invalid.";
      formIsValid = false;
    }

    // Password validation
    if (!formValues.password) {
      tempErrors.password = "Please enter a password.";
      formIsValid = false;
    } else if (formValues.password.length < 6) {
      tempErrors.password = "Password must be at least 6 characters.";
      formIsValid = false;
    }

    // Confirm password validation
    if (!formValues.confirmPassword) {
      tempErrors.confirmPassword = "Please confirm your password.";
      formIsValid = false;
    } else if (formValues.password !== formValues.confirmPassword) {
      tempErrors.confirmPassword = "Passwords do not match.";
      formIsValid = false;
    }

    setErrors(tempErrors);
    return formIsValid;
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFormValues({
      ...formValues,
      [event.target.name]: event.target.value,
    });
    // Clear error when user starts typing
    if (errors[event.target.name as keyof Errors]) {
      setErrors({ ...errors, [event.target.name]: undefined });
    }
    if (serverError) setServerError("");
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    setServerError("");

    try {
      await signup({
        name: formValues.name,
        email: formValues.email,
        password: formValues.password,
      });
      router.push("/auth/login");
    } catch (error: any) {
      setServerError(error.message || "Signup failed. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const togglePasswordVisibility = (field: 'password' | 'confirmPassword') => {
    if (field === 'password') {
      setShowPassword(!showPassword);
    } else {
      setShowConfirmPassword(!showConfirmPassword);
    }
  };

  const passwordRequirements = [
    { text: "At least 6 characters", meets: formValues.password.length >= 6 },
    { text: "Contains uppercase letter", meets: /[A-Z]/.test(formValues.password) },
    { text: "Contains number", meets: /\d/.test(formValues.password) },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-gray-900 dark:to-gray-800 px-4 py-12">
      <div className="max-w-md w-full">
        {/* Logo/Brand */}
        <div className="text-center mb-8">
          <div className="flex justify-center mb-4">
            <div className="w-12 h-12 bg-indigo-600 rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
              </svg>
            </div>
          </div>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">Join Short.Url</h1>
          <p className="mt-2 text-gray-600 dark:text-gray-300">
            Create your account and start shortening URLs today.
          </p>
        </div>

        {/* Card */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8">
          {/* Server Error */}
          {serverError && (
            <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-xl">
              <p className="text-sm text-red-600 dark:text-red-400 text-center">
                {serverError}
              </p>
            </div>
          )}

          {/* Signup Form */}
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Name Input */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Full Name
              </label>
              <div className="relative">
                <input
                  id="name"
                  name="name"
                  type="text"
                  autoComplete="name"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.name
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                  placeholder="John Doe"
                  value={formValues.name}
                  onChange={handleChange}
                  aria-invalid={!!errors.name}
                  aria-describedby={errors.name ? "name-error" : undefined}
                />
                {errors.name && (
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.name && (
                <p id="name-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.name}
                </p>
              )}
            </div>

            {/* Email Input */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  className={`w-full px-4 py-3 rounded-xl border ${
                    errors.email
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                  placeholder="you@example.com"
                  value={formValues.email}
                  onChange={handleChange}
                  aria-invalid={!!errors.email}
                  aria-describedby={errors.email ? "email-error" : undefined}
                />
                {errors.email && (
                  <div className="absolute right-3 top-3">
                    <svg className="w-5 h-5 text-red-500" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                )}
              </div>
              {errors.email && (
                <p id="email-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.email}
                </p>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Password
              </label>
              <div className="relative">
                <input
                  id="password"
                  name="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.password
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                  placeholder="Create a strong password"
                  value={formValues.password}
                  onChange={handleChange}
                  aria-invalid={!!errors.password}
                  aria-describedby={errors.password ? "password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('password')}
                  className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>

              {/* Password Requirements */}
              <div className="mt-3 space-y-2">
                {passwordRequirements.map((req, index) => (
                  <div key={index} className="flex items-center">
                    <CheckCircleIcon
                      className={`w-4 h-4 mr-2 ${
                        req.meets
                          ? "text-green-500"
                          : "text-gray-400"
                      }`}
                    />
                    <span className={`text-xs ${
                      req.meets
                        ? "text-green-600 dark:text-green-400"
                        : "text-gray-500 dark:text-gray-400"
                    }`}>
                      {req.text}
                    </span>
                  </div>
                ))}
              </div>

              {errors.password && (
                <p id="password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.password}
                </p>
              )}
            </div>

            {/* Confirm Password Input */}
            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Confirm Password
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  required
                  className={`w-full px-4 py-3 pr-12 rounded-xl border ${
                    errors.confirmPassword
                      ? "border-red-500 focus:ring-red-500 focus:border-red-500"
                      : "border-gray-300 dark:border-gray-600 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                  } bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-500 dark:placeholder-gray-400 transition-all duration-200`}
                  placeholder="Confirm your password"
                  value={formValues.confirmPassword}
                  onChange={handleChange}
                  aria-invalid={!!errors.confirmPassword}
                  aria-describedby={errors.confirmPassword ? "confirm-password-error" : undefined}
                />
                <button
                  type="button"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                  className="absolute right-3 top-3 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
                  aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                >
                  {showConfirmPassword ? (
                    <EyeSlashIcon className="w-5 h-5" />
                  ) : (
                    <EyeIcon className="w-5 h-5" />
                  )}
                </button>
              </div>
              {errors.confirmPassword && (
                <p id="confirm-password-error" className="mt-2 text-sm text-red-600 dark:text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>

            {/* Terms Agreement */}
            <div className="flex items-start">
              <div className="flex items-center h-5">
                <input
                  id="terms"
                  name="terms"
                  type="checkbox"
                  required
                  className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 dark:border-gray-600 rounded"
                />
              </div>
              <div className="ml-3 text-sm">
                <label htmlFor="terms" className="text-gray-700 dark:text-gray-300">
                  I agree to the{" "}
                  <Link href="/terms" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-500">
                    Privacy Policy
                  </Link>
                </label>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
            >
              {isLoading ? (
                <div className="flex items-center justify-center">
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                  </svg>
                  Creating account...
                </div>
              ) : (
                "Create account"
              )}
            </button>
          </form>

          {/* Login Link */}
          <div className="mt-8 text-center">
            <p className="text-gray-600 dark:text-gray-400">
              Already have an account?{" "}
              <Link
                href="/auth/login"
                className="font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-500 dark:hover:text-indigo-300 transition-colors duration-200"
              >
                Sign in
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-8 text-center text-sm text-gray-500 dark:text-gray-400">
          <p>Free plan includes up to 100 URL shortenings per month.</p>
        </div>
      </div>
    </div>
  );
};

export default SignUpPage;