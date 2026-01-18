import React, { useState, useEffect } from 'react';
import { Head, useForm, router } from '@inertiajs/react';
import { Button, Input, Label } from '../../Components/ReusableUI';
import Icon from '../../Components/Icon';

const Login: React.FC = () => {


  const { data, setData, post, processing, errors, reset } = useForm({
      email: '',
      password: '',
      remember: false,
  });

  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
      return () => {
          reset('password');
      };
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    post(route('login'));
  };

  return (
    <div className="min-h-screen flex w-full font-sans bg-white dark:bg-[#0d151c]">
      <Head title="Login Portal" />

      {/* LEFT SIDE - Branding */}
      <div className="hidden lg:flex w-1/2 bg-[#0A2647] text-white p-16 flex-col justify-center relative overflow-hidden">
         {/* Background decoration */}
         <div className="absolute top-0 left-0 w-full h-full opacity-10"
              style={{ backgroundImage: 'radial-gradient(circle at 2px 2px, white 1px, transparent 0)', backgroundSize: '40px 40px' }}>
         </div>

         <div className="max-w-md z-10">
            <div className="size-24 rounded-3xl bg-[#143d6e] flex items-center justify-center mb-8 shadow-inner border border-white/10">
                <Icon name="school" className="text-5xl text-blue-200" />
            </div>

            <h1 className="text-5xl font-bold mb-4 tracking-tight">
                Universitas Shane
            </h1>
            <h2 className="text-2xl font-light text-blue-200 mb-8">
                Academic Portal
            </h2>

            <p className="text-blue-100/80 text-lg leading-relaxed">
                Akses seluruh layanan akademik Anda dalam satu platform terintegrasi. Kelola KRS, lihat nilai, dan pembayaran SPP dengan mudah.
            </p>
         </div>
      </div>

      {/* RIGHT SIDE - Form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-8 lg:p-24">
        <div className="w-full max-w-md animate-fade-in-up">

            {/* Tombol Kembali */}
            <button onClick={() => router.visit('/')} className="mb-8 text-gray-500 hover:text-primary flex items-center gap-2 text-sm font-medium transition-colors">
                <Icon name="arrow_back" /> Back to Home
            </button>

            <div className="mb-10">
                <h2 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">Welcome Back!</h2>
                <p className="text-gray-500 dark:text-gray-400">Please enter your credentials to sign in.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">

                {/* Email Input */}
                <div className="space-y-2">
                    <Label htmlFor="email">Email Address</Label>
                    <div className="relative group">
                        <Input
                            id="email"
                            type="email"
                            value={data.email}
                            onChange={(e) => setData('email', e.target.value)}
                            placeholder="admin@lms.com"
                            className="pl-11 py-3"
                            required
                            autoFocus
                        />
                        <Icon name="mail" className="absolute left-3.5 top-3.5 text-gray-400 text-xl" />
                    </div>
                    {errors.email && <p className="text-sm text-red-600 mt-1">{errors.email}</p>}
                </div>

                {/* Password Input */}
                <div className="space-y-2">
                    <div className="flex justify-between items-center">
                        <Label htmlFor="password">Password</Label>
                        {/* Optional: Link Forgot Password */}
                        <a href="#" className="text-xs text-primary hover:underline">Forgot Password?</a>
                    </div>
                    <div className="relative group">
                        <Input
                            id="password"
                            type={showPassword ? "text" : "password"}
                            value={data.password}
                            onChange={(e) => setData('password', e.target.value)}
                            placeholder="Enter your password"
                            className="pl-11 pr-11 py-3"
                            required
                        />
                        <Icon name="lock" className="absolute left-3.5 top-3.5 text-gray-400 text-xl" />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 top-3.5 text-gray-400 hover:text-gray-600 focus:outline-none"
                        >
                            <Icon name={showPassword ? "visibility_off" : "visibility"} className="text-xl" />
                        </button>
                    </div>
                    {errors.password && <p className="text-sm text-red-600 mt-1">{errors.password}</p>}
                </div>

                {/* Remember Me Checkbox */}
                <div className="flex items-center">
                    <input
                        type="checkbox"
                        id="remember"
                        className="rounded border-gray-300 text-primary shadow-sm focus:ring-primary"
                        checked={data.remember}
                        onChange={(e) => setData('remember', e.target.checked)}
                    />
                    <label htmlFor="remember" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">Remember me</label>
                </div>

                <Button type="submit" className="w-full py-3 text-base mt-2 shadow-lg shadow-primary/25" isLoading={processing}>
                    Sign In
                    <Icon name="arrow_forward" className="text-lg" />
                </Button>
            </form>

             <div className="mt-8 text-center text-sm text-gray-500">
                <p>Login problem? <a href="#" className="text-primary font-medium hover:underline">Contact IT Support</a></p>
             </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
