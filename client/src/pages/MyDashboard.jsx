import React, { useState, useContext } from 'react';
import { AuthContext } from '../context/AuthContext';
import { authService } from '../services/api';
import { Card, CardContent } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Input } from '../components/ui/Input';
import { toast } from 'react-toastify';
import { User, Lock, Shield, Mail, KeyRound } from 'lucide-react';

const MyDashboard = () => {
  const { user } = useContext(AuthContext);

  // Password State
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [submittingPassword, setSubmittingPassword] = useState(false);

  const handlePasswordChange = async (e) => {
    e.preventDefault();
    if (newPassword !== confirmPassword) {
      toast.error('New passwords do not match');
      return;
    }
    if (newPassword.length < 6) {
      toast.error('New password must be at least 6 characters');
      return;
    }
    setSubmittingPassword(true);
    try {
      await authService.changePassword(currentPassword, newPassword);
      toast.success('Password changed successfully');
      setShowChangePassword(false);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err) {
      const errorMsg = err.response?.data?.error || err.message || 'Failed to change password';
      toast.error(errorMsg);
    } finally {
      setSubmittingPassword(false);
    }
  };

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 pb-12">
      {/* Top Welcome Bar */}
      <div className="flex flex-wrap justify-between items-center gap-4 border-b border-slate-200 dark:border-slate-800 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">My Dashboard</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400">Manage your personal profile and account security details.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Profile Card */}
        <Card className="shadow-2xl md:col-span-1 h-fit">
          <CardContent className="space-y-6 pt-6 pb-6">
            <div className="flex flex-col items-center text-center space-y-3">
              <div className="w-20 h-20 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center text-blue-500 shadow-inner">
                <User className="h-10 w-10" />
              </div>
              <div>
                <h2 className="text-lg font-extrabold text-slate-900 dark:text-white">{user?.name}</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400 capitalize font-semibold tracking-wider mt-0.5 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800 inline-block border border-slate-200 dark:border-slate-700/50">
                  {user?.role || 'User'}
                </p>
              </div>
            </div>

            <div className="border-t border-slate-200 dark:border-slate-800 pt-4 space-y-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex-shrink-0">
                  <Mail className="h-4 w-4" />
                </div>
                <div className="min-w-0">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Email Address</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate block">{user?.email}</span>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-blue-50 dark:bg-blue-950/30 text-blue-500 flex-shrink-0">
                  <Shield className="h-4 w-4" />
                </div>
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">Account Status</span>
                  <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 flex items-center gap-1 mt-0.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    Active & Verified
                  </span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Security Settings Card */}
        <Card className="shadow-2xl md:col-span-2">
          <CardContent className="space-y-6 pt-6">
            <div className="flex items-center gap-3 border-b border-slate-200 dark:border-slate-800 pb-3">
              <div className="p-2 rounded-lg bg-blue-600/10 text-blue-500">
                <KeyRound className="h-5 w-5" />
              </div>
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security Settings</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">Update your login password and manage credentials</p>
              </div>
            </div>

            {!showChangePassword ? (
              <div className="space-y-4 py-4">
                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                  We recommend using a strong password that you do not use for other accounts. Your password must be at least 6 characters long and should contain a mix of letters, numbers, and special symbols.
                </p>
                <Button 
                  onClick={() => setShowChangePassword(true)}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold h-10 px-5 rounded-xl flex items-center gap-2 shadow-lg shadow-blue-500/15 w-fit"
                >
                  <Lock className="h-4 w-4" />
                  Change Password
                </Button>
              </div>
            ) : (
              <form onSubmit={handlePasswordChange} className="space-y-4 max-w-md">
                <div className="space-y-3.5">
                  <Input
                    label="Current Password"
                    type="password"
                    required
                    value={currentPassword}
                    onChange={(e) => setCurrentPassword(e.target.value)}
                    placeholder="••••••••"
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    label="New Password"
                    type="password"
                    required
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Min. 6 characters"
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                  <Input
                    label="Confirm New Password"
                    type="password"
                    required
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="bg-slate-100/80 dark:bg-slate-950 border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-600 focus:border-blue-500 focus:ring-blue-500"
                  />
                </div>

                <div className="flex gap-3 pt-2">
                  <Button 
                    type="button" 
                    onClick={() => {
                      setShowChangePassword(false);
                      setCurrentPassword('');
                      setNewPassword('');
                      setConfirmPassword('');
                    }}
                    variant="outline"
                    className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 rounded-xl h-10 px-5"
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    disabled={submittingPassword}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl h-10 px-6 shadow-lg shadow-blue-500/15"
                  >
                    {submittingPassword ? 'Updating...' : 'Update Password'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default MyDashboard;
