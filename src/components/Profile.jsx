import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { db, auth, storage } from '../firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import toast from 'react-hot-toast';

function Profile() {
    const { userId } = useParams();
    const currentUser = auth.currentUser;
    const [profileData, setProfileData] = useState({ name: '', contactNumber: '', gender: '', profilePicUrl: '' });
    const [imageFile, setImageFile] = useState(null);
    const [loading, setLoading] = useState(true);
    const isOwnProfile = currentUser && currentUser.uid === userId;

    useEffect(() => {
        const fetchUserProfile = async () => {
            if (!userId) {
                setLoading(false);
                return;
            }
            const docRef = doc(db, 'users', userId);
            const docSnap = await getDoc(docRef);
            if (docSnap.exists()) {
                setProfileData(docSnap.data());
            } else {
                console.log("No such user profile!");
            }
            setLoading(false);
        };
        fetchUserProfile();
    }, [userId]);

    const handleImageChange = (e) => {
        if (e.target.files[0]) {
            setImageFile(e.target.files[0]);
        }
    };

    const handleSaveChanges = async (e) => {
        e.preventDefault();
        if (!isOwnProfile) return;
        
        const userDocRef = doc(db, 'users', userId);
        const loadingToast = toast.loading("Updating profile...");

        try {
            let updatedData = {
                name: profileData.name,
                contactNumber: profileData.contactNumber,
                gender: profileData.gender,
            };

            if (imageFile) {
                const imageRef = ref(storage, `profile-pics/${userId}`);
                await uploadBytes(imageRef, imageFile);
                const newProfilePicUrl = await getDownloadURL(imageRef);
                updatedData.profilePicUrl = newProfilePicUrl;
                // Update local state to show new image immediately
                setProfileData(prev => ({...prev, profilePicUrl: newProfilePicUrl}));
            }
            
            await updateDoc(userDocRef, updatedData);
            
            toast.dismiss(loadingToast);
            toast.success("Profile updated successfully!");
        } catch (error) {
            toast.dismiss(loadingToast);
            toast.error("Failed to update profile.");
            console.error("Error updating profile: ", error);
        }
    };

    if (loading) {
        return <div className="text-center mt-10">Loading profile...</div>;
    }

    if (!isOwnProfile) {
        return (
            <div className="container mx-auto p-8">
                <div className="max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
                    <h1 className="text-3xl font-bold text-center">{profileData.name}</h1>
                    <p className="text-center text-gray-600 mt-2">Viewing user profile.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto max-w-2xl py-12 px-4">
            <div className="bg-white p-8 rounded-lg shadow-md">
                <h1 className="text-3xl font-bold text-gray-800 mb-6">Your Profile</h1>
                <form onSubmit={handleSaveChanges}>
                    <div className="flex flex-col items-center mb-6">
                        <img 
                           src={imageFile ? URL.createObjectURL(imageFile) : profileData.profilePicUrl || `https://ui-avatars.com/api/?name=${profileData.name}&background=random`} 
                           alt="Profile" 
                           className="w-32 h-32 rounded-full object-cover mb-4 border-4 border-gray-200"
                        />
                        <label className="cursor-pointer bg-gray-200 hover:bg-gray-300 px-4 py-2 rounded-md text-sm font-semibold">
                            Change Picture
                            <input type="file" onChange={handleImageChange} className="hidden" accept="image/*" />
                        </label>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                        <div>
                            <label className="block text-gray-700 font-semibold">Name</label>
                            <input
                                type="text"
                                name="name"
                                value={profileData.name || ''}
                                onChange={(e) => setProfileData({...profileData, name: e.target.value})}
                                className="w-full mt-1 px-4 py-2 border rounded-lg"
                            />
                        </div>
                        <div>
                            <label className="block text-gray-700 font-semibold">Contact Number</label>
                            <input
                                type="tel"
                                name="contactNumber"
                                value={profileData.contactNumber || ''}
                                onChange={(e) => setProfileData({...profileData, contactNumber: e.target.value})}
                                className="w-full mt-1 px-4 py-2 border rounded-lg"
                            />
                        </div>
                    </div>
                    
                    <div className="mb-6">
                        <label className="block text-gray-700 font-semibold mb-2">Gender</label>
                        <div className="flex gap-4">
                            <button type="button" onClick={() => setProfileData({...profileData, gender: 'Male'})} className={`px-6 py-2 rounded-full ${profileData.gender === 'Male' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}>Male</button>
                            <button type="button" onClick={() => setProfileData({...profileData, gender: 'Female'})} className={`px-6 py-2 rounded-full ${profileData.gender === 'Female' ? 'bg-pink-500 text-white' : 'bg-gray-200'}`}>Female</button>
                        </div>
                    </div>

                    <button type="submit" className="w-full bg-green-500 text-white font-bold py-3 px-6 rounded-lg hover:bg-green-600 transition-colors">
                        Save Changes
                    </button>
                </form>
            </div>
        </div>
    );
}

export default Profile;