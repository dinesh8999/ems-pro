import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';
import AnimatedBackground from '../components/AnimatedBackground';
import api from '../api/axios';

const Profile = () => {
  const user = JSON.parse(localStorage.getItem('user') || '{}');
  const isAdmin = user.role === 'admin';

  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState({ type: '', text: '' });
  const [showPasswordChange, setShowPasswordChange] = useState(false);
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    department: '',
    position: '',
    joinDate: '',
    avatar: ''
  });

  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  useEffect(() => {
    fetchProfile();
  }, []);

  const fetchProfile = async () => {
    try {
      if (isAdmin) {
        setProfileData({
          name: user.name || 'Administrator',
          email: user.email || 'admin@ems.com',
          phone: user.phone || 'N/A',
          address: user.address || 'Headquarters',
          department: 'Administration',
          position: 'System Administrator',
          joinDate: user.createdAt ? new Date(user.createdAt).toISOString().split('T')[0] : '',
          avatar: user.avatar || ''
        });
        setLoading(false);
        return;
      }

      const response = await api.get(`/employees/${user.id}`);
      if (response.data.success) {
        const employee = response.data.data;
        setProfileData({
          name: employee.name || user.name || '',
          email: employee.email || user.email || '',
          phone: employee.phone || '',
          address: employee.address || '',
          department: employee.department || 'General',
          position: employee.position || 'Employee',
          joinDate: employee.joinDate ? new Date(employee.joinDate).toISOString().split('T')[0] : '',
          avatar: employee.avatar || user.avatar || ''
        });
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
      setProfileData({
        name: user.name || (isAdmin ? 'Administrator' : 'User'),
        email: user.email || '',
        phone: user.phone || '',
        address: user.address || '',
        department: isAdmin ? 'Administration' : 'General',
        position: isAdmin ? 'System Administrator' : 'Employee',
        joinDate: '',
        avatar: user.avatar || ''
      });
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const compressImage = (file, maxWidth = 400, maxHeight = 400, quality = 0.85) => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = (event) => {
        const img = new Image();
        img.src = event.target.result;
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;

          if (width > height) {
            if (width > maxWidth) {
              height = Math.round((height * maxWidth) / width);
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round((width * maxHeight) / height);
              height = maxHeight;
            }
          }

          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx.drawImage(img, 0, 0, width, height);
          const dataUrl = canvas.toDataURL('image/jpeg', quality);
          resolve(dataUrl);
        };
        img.onerror = (err) => reject(err);
      };
      reader.onerror = (err) => reject(err);
    });
  };

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      setMessage({ type: 'error', text: 'Please select a valid image file.' });
      return;
    }

    try {
      const base64String = await compressImage(file);
      setProfileData(prev => ({ ...prev, avatar: base64String }));

      if (isAdmin) {
        await api.put('/auth/profile', { avatar: base64String, name: profileData.name });
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('admin', JSON.stringify(updatedUser));
      } else {
        await api.put(`/employees/${user.id}/profile`, { avatar: base64String, name: profileData.name });
        const updatedUser = { ...user, avatar: base64String };
        localStorage.setItem('user', JSON.stringify(updatedUser));
      }
      window.dispatchEvent(new Event('storage'));
      setMessage({ type: 'success', text: 'Profile picture updated successfully!' });
      setTimeout(() => setMessage({ type: '', text: '' }), 3000);
    } catch (err) {
      console.error('Error saving profile picture:', err);
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to save profile picture' });
    }
  };

  const handlePasswordChange = (e) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      if (isAdmin) {
        await api.put('/auth/profile', { name: profileData.name, avatar: profileData.avatar });
        const updatedUser = { ...user, name: profileData.name, phone: profileData.phone, address: profileData.address, avatar: profileData.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        localStorage.setItem('admin', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
        setSaving(false);
        return;
      }

      const response = await api.put(`/employees/${user.id}/profile`, {
        name: profileData.name,
        phone: profileData.phone,
        address: profileData.address,
        avatar: profileData.avatar
      });
      if (response.data.success) {
        setMessage({ type: 'success', text: 'Profile updated successfully!' });
        setEditing(false);
        const updatedUser = { ...user, name: profileData.name, email: profileData.email, avatar: profileData.avatar };
        localStorage.setItem('user', JSON.stringify(updatedUser));
        window.dispatchEvent(new Event('storage'));
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to update profile' });
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setMessage({ type: 'error', text: 'New passwords do not match' });
      return;
    }

    if (passwordData.newPassword.length < 6) {
      setMessage({ type: 'error', text: 'Password must be at least 6 characters' });
      return;
    }

    setSaving(true);
    setMessage({ type: '', text: '' });

    try {
      const response = await api.put(isAdmin ? '/auth/change-password' : `/employees/${user.id}/password`, {
        currentPassword: passwordData.currentPassword,
        newPassword: passwordData.newPassword
      });

      if (response.data.success) {
        setMessage({ type: 'success', text: 'Password changed successfully!' });
        setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setShowPasswordChange(false);
        setTimeout(() => setMessage({ type: '', text: '' }), 3000);
      }
    } catch (error) {
      console.error('Error changing password:', error);
      setMessage({ type: 'error', text: error.response?.data?.message || 'Failed to change password' });
    } finally {
      setSaving(false);
    }
  };

  const cancelEdit = () => {
    setEditing(false);
    fetchProfile();
  };

  const inputClass =
    'w-full px-4 py-2.5 border-0 rounded-lg shadow-md focus:ring-0 focus:outline-none focus:shadow-xl bg-primary-2 text-primary-5 disabled:bg-slate-100 disabled:text-slate-500 disabled:cursor-not-allowed transition';

  if (loading) {
    return (
      <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
        <Navbar />
        <AnimatedBackground />
        <div className="relative z-10 flex items-center justify-center h-[70vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-4"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen app-theme-bg flex flex-col transition-colors duration-300">
      <Navbar />
      <AnimatedBackground />

      <div className="flex-1 w-full max-w-[2000px] mx-auto px-[2cm] py-6 flex flex-col relative z-10 min-h-0 overflow-y-auto custom-scrollbar">
        <div className="mb-8 animate-fade-in">
          <h1 className="text-4xl md:text-5xl leading-tight font-bold text-primary-5 w-fit pb-2">
            My Profile
          </h1>
          <p className="text-primary-4 mt-2 text-base md:text-lg">Manage your personal information and security settings</p>
        </div>

        {message.text && (
          <div
            className={`mb-6 p-4 rounded-lg border ${message.type === 'success'
                ? 'bg-secondary-4/10 border-secondary-4/30 text-secondary-4 font-semibold'
                : 'bg-red-50 border-red-200 text-red-800 font-semibold'
              }`}
          >
            {message.text}
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-1">
            <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
              <div className="text-center">
                {/* Profile Picture Container with Upload */}
                <div className="relative group inline-block mb-4">
                  {profileData.avatar ? (
                    <img
                      src={profileData.avatar}
                      alt="Profile Avatar"
                      className="w-24 h-24 rounded-full object-cover shadow-lg border-2 border-[#7C3AED]"
                    />
                  ) : (
                    <div className="inline-flex items-center justify-center w-24 h-24 icon-container rounded-full shadow-md">
                      <span className="text-3xl font-bold text-white">
                        {profileData.name?.charAt(0)?.toUpperCase() || 'A'}
                      </span>
                    </div>
                  )}
                  <label
                    className="absolute bottom-0 right-0 bg-[#7C3AED] hover:bg-[#6D28D9] text-white p-2 rounded-full shadow-lg cursor-pointer transition-all duration-300 hover:scale-110 flex items-center justify-center border-2 border-white"
                    title="Upload profile picture"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                <h2 className="text-2xl font-bold text-primary-5 mb-1">{profileData.name || 'Administrator'}</h2>
                <p className="text-primary-4 font-semibold mb-1">{profileData.position || (isAdmin ? 'System Administrator' : 'Employee')}</p>
                <p className="text-sm text-slate-500 mb-3">{profileData.department || (isAdmin ? 'Administration' : 'General')}</p>

                <span className="px-3 py-1 bg-[#7C3AED]/15 text-[#7C3AED] rounded-full text-xs font-bold uppercase tracking-wider">
                  {isAdmin ? 'Administrator' : 'Employee'}
                </span>

                <div className="mt-6 pt-6 border-t border-primary-3">
                  <div className="space-y-3 text-sm">
                    <div className="flex items-center justify-between">
                      <span className="text-primary-4">Account Status</span>
                      <span className="px-3 py-1 bg-secondary-4/10 text-secondary-4 rounded-full text-xs font-semibold">
                        Active
                      </span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-primary-4">Role</span>
                      <span className="text-primary-5 font-semibold capitalize">
                        {user.role || 'Admin'}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-xl md:text-2xl font-bold text-primary-5">Profile Information</h3>
                {!editing && (
                  <button
                    onClick={() => setEditing(true)}
                    className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all flex items-center gap-1.5 cursor-pointer"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <span>Edit Profile</span>
                  </button>
                )}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Full Name</label>
                    <input
                      type="text"
                      name="name"
                      value={profileData.name}
                      onChange={handleChange}
                      disabled={!editing}
                      className={inputClass}
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Email Address</label>
                    <input
                      type="email"
                      name="email"
                      value={profileData.email}
                      disabled
                      className={inputClass}
                      title="Email cannot be changed"
                    />
                    <p className="text-xs text-slate-500 mt-1">Email address must be in format user@ems.com</p>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Phone Number</label>
                      <input
                        type="tel"
                        name="phone"
                        value={profileData.phone}
                        onChange={handleChange}
                        disabled={!editing}
                        className={inputClass}
                        placeholder="Enter phone number"
                      />
                    </div>

                    <div>
                      <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Department</label>
                      <input type="text" value={profileData.department} disabled className={inputClass} />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Position</label>
                    <input type="text" value={profileData.position} disabled className={inputClass} />
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Address</label>
                    <textarea
                      name="address"
                      value={profileData.address}
                      onChange={handleChange}
                      disabled={!editing}
                      rows="3"
                      className={inputClass}
                      placeholder="Enter address"
                    />
                  </div>
                </div>

                {editing && (
                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                    <button
                      type="button"
                      onClick={cancelEdit}
                      disabled={saving}
                      className="border border-primary-3 bg-primary-2 text-primary-4 px-5 py-2.5 rounded-lg text-xs font-semibold transition-all duration-300 hover:bg-secondary-3 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>

            {/* Change Password Card */}
            <div className="bg-primary-2/90 rounded-2xl shadow-lg p-6 border border-primary-3">
              <div className="flex justify-between items-center">
                <div>
                  <h3 className="text-xl md:text-2xl font-bold text-primary-5">Security Settings</h3>
                  <p className="text-sm text-primary-4 mt-1">Manage your account password</p>
                </div>
                <button
                  type="button"
                  onClick={() => setShowPasswordChange(!showPasswordChange)}
                  className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-4 py-2 rounded-lg shadow-sm transition-all cursor-pointer"
                >
                  {showPasswordChange ? 'Cancel' : 'Change Password'}
                </button>
              </div>

              {showPasswordChange && (
                <form onSubmit={handlePasswordSubmit} className="mt-6 pt-6 border-t border-primary-3 space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Current Password</label>
                    <div className="relative">
                      <input
                        type={showCurrentPassword ? "text" : "password"}
                        name="currentPassword"
                        value={passwordData.currentPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pr-10`}
                        placeholder="Enter current password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        title={showCurrentPassword ? "Hide password" : "Show password"}
                      >
                        {showCurrentPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">New Password</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? "text" : "password"}
                        name="newPassword"
                        value={passwordData.newPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pr-10`}
                        placeholder="Enter new password (min 6 chars)"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword(!showNewPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        title={showNewPassword ? "Hide password" : "Show password"}
                      >
                        {showNewPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wide font-semibold text-primary-4 mb-1.5">Confirm New Password</label>
                    <div className="relative">
                      <input
                        type={showConfirmPassword ? "text" : "password"}
                        name="confirmPassword"
                        value={passwordData.confirmPassword}
                        onChange={handlePasswordChange}
                        className={`${inputClass} pr-10`}
                        placeholder="Confirm new password"
                        required
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        title={showConfirmPassword ? "Hide password" : "Show password"}
                      >
                        {showConfirmPassword ? (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858-5.908a10.025 10.025 0 0110.122 3.937M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M3 3l18 18" />
                          </svg>
                        ) : (
                          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                          </svg>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={saving}
                      className="bg-[#7C3AED] hover:bg-[#6D28D9] text-white text-xs font-semibold px-5 py-2.5 rounded-lg shadow-sm transition-all disabled:opacity-50 cursor-pointer"
                    >
                      {saving ? 'Updating...' : 'Update Password'}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;
