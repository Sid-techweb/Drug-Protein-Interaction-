import React, { useState } from 'react';
import { Mail, Lock, User, Building, Eye, EyeOff, ArrowRight, Dna } from 'lucide-react';
import { Button } from '../ui/Button';
import { Input } from '../ui/Input';
import { useAuth } from '../../contexts/AuthContext';
import { authApi } from '../../api/authApi';
import { useToast } from '../../contexts/ToastContext';
import { useNavigate, Link } from 'react-router-dom';

export const RegisterForm: React.FC = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [organization, setOrganization] = useState('');
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

    if (!fullName || !email || !password) {
      setErrorMsg('Please fill in all required fields.');
      return;
    }

    if (password.length < 8) {
      setErrorMsg('Password must be at least 8 characters long.');
      return;
    }

    setIsLoading(true);
    try {
      const tokens = await authApi.register({
        email,
        password,
        full_name: fullName,
        organization: organization || 'Pharma R&D Partner',
      });
      loginTokens(tokens);
      showToast('Researcher Account created successfully!', 'success');
      navigate('/screening');
    } catch (err: any) {
      const detail = err.response?.data?.detail || 'Registration failed. Email may already be in use.';
      setErrorMsg(detail);
      showToast(detail, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md bg-white/90 dark:bg-slate-950/80 backdrop-blur-xl border border-purple-200 dark:border-purple-500/20 rounded-3xl p-8 shadow-xl dark:shadow-2xl space-y-6 text-slate-900 dark:text-slate-100 transition-colors duration-300">
      
      {/* Header */}
      <div className="text-center space-y-2">
        <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-500 to-sky-500 p-0.5 mx-auto shadow-lg shadow-purple-500/20 dark:shadow-purple-500/30">
          <div className="w-full h-full bg-white dark:bg-slate-950 rounded-[14px] flex items-center justify-center">
            <Dna className="w-7 h-7 text-purple-600 dark:text-purple-400" />
          </div>
        </div>
        <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Create Researcher Account</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400">Join HelixQ Enterprise Drug Screening Network</p>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {errorMsg && (
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-300 dark:border-rose-500/40 text-xs text-rose-800 dark:text-rose-300 font-medium">
            {errorMsg}
          </div>
        )}

        <Input
          label="Full Name"
          type="text"
          placeholder="Dr. Eleanor Vance"
          value={fullName}
          onChange={(e) => setFullName(e.target.value)}
          icon={<User className="w-4 h-4" />}
          required
        />

        <Input
          label="Email Address"
          type="email"
          placeholder="e.vance@biotech.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          icon={<Mail className="w-4 h-4" />}
          required
        />

        <Input
          label="Organization / Institute"
          type="text"
          placeholder="Oncology R&D Lab"
          value={organization}
          onChange={(e) => setOrganization(e.target.value)}
          icon={<Building className="w-4 h-4" />}
        />

        <div className="relative">
          <Input
            label="Password (min 8 chars)"
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
          {isLoading ? 'Creating Account...' : 'Register Researcher Account'}
        </Button>
      </form>

      {/* Footer link */}
      <div className="text-center text-xs text-slate-500 dark:text-slate-400 pt-2">
        Already have an account?{' '}
        <Link to="/login" className="text-purple-600 dark:text-sky-400 font-semibold hover:underline">
          Sign In Here
        </Link>
      </div>

    </div>
  );
};
