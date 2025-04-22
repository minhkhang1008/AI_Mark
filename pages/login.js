// pages/login.js
import { useState } from "react";
import { useRouter } from "next/router";
import { useAuth } from "../contexts/AuthContext";

export default function Login() {
  const { user, loading, signIn, signInWithGoogle } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  if (!loading && user) {
    router.replace("/");
    return null;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await signIn(email, pass);
      router.push("/");
    } catch (e) {
      setError(e.message);
    }
  };

  const handleGoogle = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleSubmit}
        className="bg-white p-8 rounded shadow-md w-full max-w-sm space-y-4"
      >
        <h2 className="text-2xl font-bold text-center">Đăng nhập</h2>
        {error && <p className="text-red-500">{error}</p>}
        <input
          type="email"
          placeholder="Email"
          className="w-full border p-2 rounded"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          placeholder="Mật khẩu"
          className="w-full border p-2 rounded"
          value={pass}
          onChange={(e) => setPass(e.target.value)}
          required
        />
        <button className="w-full bg-blue-600 text-white p-2 rounded">
          Đăng nhập
        </button>
        <button
          type="button"
          onClick={handleGoogle}
          className="w-full bg-red-500 text-white p-2 rounded"
        >
          Đăng nhập với Google
        </button>
      </form>
    </div>
  );
}
