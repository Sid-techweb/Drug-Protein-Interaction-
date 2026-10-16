import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Dna } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate, Link } from 'react-router-dom';

export const LoginForm: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const { loginTokens } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!email || !password) {
      setErrorMsg('Please enter email and password.');
      return;
    }

    setIsLoading(true);
    try {
      const tokens = await authApi.login({ email, password });
      loginTokens(tokens);
      showToast('Authentication successful! Welcome to HelixQ Portal.', 'success');
      navigate('/screening');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Invalid login credentials.';
      setErrorMsg(detail);
      showToast(detail, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-purple-200 dark:border-sky-500/20 rounded-3xl p-8 shadow-xl dark:shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-sky-500 to-purple-600 p-0.5 mx-auto shadow-lg shadow-purple-500/10 dark:shadow-sky-500/30">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Dna className="w-7 h-7 text-purple-600 dark:text-sky-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Biotech Portal Login</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Access Quantum-Enhanced Protein Intelligence</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        <Input
          label="Email Address"
          type="email"
          placeholder="researcher@pharma.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <div className="relative">
          <Input
            label="Password"
            type={showPassword ? 'text' : 'password'}
            placeholder="••••••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            icon={<Lock className="w-4 h-4" />}
            required
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-8 text-slate-400 hover:text-slate-700 dark:hover:text-white transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>

        <Button
          type="submit"
          variant="glow"
          size="lg"
          className="w-full justify-center mt-2"
          disabled={isLoading}
          icon={isLoading ? <span className="animate-spin">⏳</span> : <ArrowRight className="w-5 h-5" />}
        >
          {isLoading ? 'Authenticating Credentials...' : 'Sign In to Workspace'}
        </Button>
      </form>

      {/* Footer link */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
        Don't have an account?{' '}
        <Link to="/register" className="text-purple-600 dark:text-sky-400 font-semibold hover:underline">
          Register Researcher Account
        </Link>
      </div>

    </div>
  );
};
