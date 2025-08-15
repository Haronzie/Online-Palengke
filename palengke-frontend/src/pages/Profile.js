import React, { useEffect, useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { getMe } from '../api';

const Profile = () => {
  const { user, isAuthenticated } = useAuth();
  const [profileData, setProfileData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchProfile = async () => {
      if (isAuthenticated && user) {
        try {
          const response = await getMe(); // Assuming getMe fetches full user profile
          setProfileData(response.data.data);
        } catch (err) {
          setError(err);
        } finally {
          setLoading(false);
        }
      } else {
        setLoading(false);
      }
    };
    fetchProfile();
  }, [isAuthenticated, user]);

  if (loading) return <div>Loading profile...</div>;
  if (error) return <div>Error: {error.message}</div>;
  if (!profileData) return <div>No profile data available.</div>;

  return (
    <div className="profile-page bg-white p-8 rounded-lg shadow-md">
      <h1 className="text-3xl font-bold mb-4">User Profile</h1>
      <p className="text-lg mb-2">Name: {profileData.name}</p>
      <p className="text-lg mb-2">Email: {profileData.email}</p>
      <p className="text-lg mb-2">Role: {profileData.role}</p>
      {/* Add more profile details and an edit form if needed */}
    </div>
  );
};

export default Profile;
