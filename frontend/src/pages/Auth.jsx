import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import API from '../api';

export default function Auth() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ username: '', email: '', password: '' });
  const [error, setError] = useState('');
  const { login } = useContext(AuthContext);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/auth/login' : '/auth/register';
    
    try {
      const res = await API.post(endpoint, formData);
      login(res.data.user, res.data.token);
      window.location.href = '/'; // Send them back home after success
    } catch (err) {
      setError(err.response?.data?.message || 'Something went wrong');
    }
  };

  return (
    <div className="flex min-h-[80vh] items-center justify-center px-6">
      <div className="w-full max-w-sm border border-border-subtle bg-card-gray p-8 rounded-lg shadow-2xl">
        <h2 className="text-2xl font-bold tracking-tighter mb-2">
          {isLogin ? 'WELCOME BACK' : 'JOIN THE GUILD'}
        </h2>
        <p className="text-xs text-gray-500 mb-8 uppercase tracking-widest">
          {isLogin ? 'Enter your dev credentials' : 'Start showcasing your builds'}
        </p>

        {error && <div className="mb-4 text-xs font-bold text-red-500 uppercase">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          {!isLogin && (
            <input
              type="text"
              placeholder="USERNAME"
              className="w-full bg-black border border-border-subtle p-3 text-xs focus:border-mzansi-green outline-none transition-all"
              onChange={(e) => setFormData({ ...formData, username: e.target.value })}
              required
            />
          )}
          <input
            type="email"
            placeholder="EMAIL"
            className="w-full bg-black border border-border-subtle p-3 text-xs focus:border-mzansi-green outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, email: e.target.value })}
            required
          />
          <input
            type="password"
            placeholder="PASSWORD"
            className="w-full bg-black border border-border-subtle p-3 text-xs focus:border-mzansi-green outline-none transition-all"
            onChange={(e) => setFormData({ ...formData, password: e.target.value })}
            required
          />
          <button className="w-full bg-white text-black font-black py-3 text-xs uppercase hover:bg-mzansi-green transition-all mt-4">
            {isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <button 
          onClick={() => setIsLogin(!isLogin)}
          className="w-full mt-6 text-[10px] text-gray-500 hover:text-white uppercase tracking-widest transition-colors"
        >
          {isLogin ? "Don't have an account? Register" : "Already a member? Sign In"}
        </button>
      </div>
    </div>
  );
}