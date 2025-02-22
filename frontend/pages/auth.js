import { useState } from "react";
import axios from "axios";

export default function Auth() {
  const [form, setForm] = useState({ name: "", email: "", password: "", isLogin: true });

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    const endpoint = form.isLogin ? "/api/auth/login" : "/api/auth/signup";
    
    try {
      const res = await axios.post(`http://localhost:5000${endpoint}`, form);
      console.log("Success:", res.data);
    } catch (error) {
      console.error("Error:", error.response.data);
    }
  };

  return (
    <div>
      <h1>{form.isLogin ? "Login" : "Signup"}</h1>
      {!form.isLogin && <input name="name" placeholder="Name" onChange={handleChange} />}
      <input name="email" type="email" placeholder="Email" onChange={handleChange} />
      <input name="password" type="password" placeholder="Password" onChange={handleChange} />
      <button onClick={handleSubmit}>{form.isLogin ? "Login" : "Signup"}</button>
      <p onClick={() => setForm({ ...form, isLogin: !form.isLogin })}>
        {form.isLogin ? "New user? Signup" : "Already have an account? Login"}
      </p>
    </div>
  );
}
