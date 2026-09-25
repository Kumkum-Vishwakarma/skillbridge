import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { useAuth } from "../hooks/useAuth.js";
import { getMyProfile, updateMyProfile } from "../api/profileService.js";
import Loader from "../components/common/Loader.jsx";

const EXPERIENCE_LEVELS = ["Beginner", "Intermediate", "Advanced"];

const Profile = () => {
  const { updateUser } = useAuth();

  const [profile, setProfile] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    location: "",
    profilePicture: "",
    experienceLevel: "Beginner",
  });

  // Fetch the current profile once on mount, matching GET /api/users/profile.
  useEffect(() => {
    const loadProfile = async () => {
      try {
        const response = await getMyProfile();
        setProfile(response.data);
        setFormData({
          name: response.data.name || "",
          bio: response.data.bio || "",
          location: response.data.location || "",
          profilePicture: response.data.profilePicture || "",
          experienceLevel: response.data.experienceLevel || "Beginner",
        });
      } catch (error) {
        // axiosInstance's response interceptor already showed an error
        // toast; nothing further is needed here beyond ending the load.
      } finally {
        setIsLoading(false);
      }
    };

    loadProfile();
  }, []);

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCancelEdit = () => {
    // Discard any unsaved changes by resetting the form back to the last
    // known-good profile data, then exit edit mode.
    setFormData({
      name: profile.name || "",
      bio: profile.bio || "",
      location: profile.location || "",
      profilePicture: profile.profilePicture || "",
      experienceLevel: profile.experienceLevel || "Beginner",
    });
    setFormError("");
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    // Client-side mirrors of the backend's Step 4 validation rules —
    // gives instant feedback before a request is even sent, while the
    // backend remains the authoritative source of truth either way.
    if (formData.name.trim().length < 2) {
      setFormError("Name must be at least 2 characters.");
      return;
    }
    if (formData.bio.length > 500) {
      setFormError("Bio cannot exceed 500 characters.");
      return;
    }
    if (
      formData.profilePicture &&
      !/^https?:\/\/.+/.test(formData.profilePicture)
    ) {
      setFormError("Profile picture must be a valid URL.");
      return;
    }

    setIsSaving(true);
    try {
      const response = await updateMyProfile(formData);
      setProfile(response.data);
      updateUser(response.data);
      toast.success("Profile updated successfully");
      setIsEditing(false);
    } catch (error) {
      // Specific backend validation errors are already shown as a toast
      // by axiosInstance's response interceptor.
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-2xl">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900">My Profile</h1>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700"
          >
            Edit Profile
          </button>
        )}
      </div>

      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-6 shadow-sm">
        {!isEditing ? (
          <div className="flex flex-col gap-4">
            <div className="flex items-center gap-4">
              {profile.profilePicture ? (
                <img
                  src={profile.profilePicture}
                  alt={profile.name}
                  className="h-16 w-16 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-blue-100 text-xl font-semibold text-blue-600">
                  {profile.name?.charAt(0).toUpperCase()}
                </div>
              )}
              <div>
                <p className="text-lg font-semibold text-gray-900">
                  {profile.name}
                </p>
                <p className="text-sm text-gray-500">{profile.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Location
                </p>
                <p className="mt-1 text-sm text-gray-800">
                  {profile.location || "Not set"}
                </p>
              </div>
              <div>
                <p className="text-xs font-medium uppercase text-gray-400">
                  Experience Level
                </p>
                <p className="mt-1 text-sm text-gray-800">
                  {profile.experienceLevel}
                </p>
              </div>
            </div>

            <div>
              <p className="text-xs font-medium uppercase text-gray-400">
                Bio
              </p>
              <p className="mt-1 whitespace-pre-wrap text-sm text-gray-800">
                {profile.bio || "No bio added yet."}
              </p>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {formError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div>
              <label
                htmlFor="name"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Name
              </label>
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
            </div>

            <div>
              <label
                htmlFor="location"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Location
              </label>
              <input
                id="location"
                name="location"
                type="text"
                value={formData.location}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Mumbai, India"
              />
            </div>

            <div>
              <label
                htmlFor="profilePicture"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Profile Picture URL
              </label>
              <input
                id="profilePicture"
                name="profilePicture"
                type="text"
                value={formData.profilePicture}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="https://example.com/avatar.jpg"
              />
            </div>

            <div>
              <label
                htmlFor="experienceLevel"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Experience Level
              </label>
              <select
                id="experienceLevel"
                name="experienceLevel"
                value={formData.experienceLevel}
                onChange={handleChange}
                className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                {EXPERIENCE_LEVELS.map((level) => (
                  <option key={level} value={level}>
                    {level}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label
                htmlFor="bio"
                className="mb-1 block text-sm font-medium text-gray-700"
              >
                Bio
              </label>
              <textarea
                id="bio"
                name="bio"
                rows={4}
                value={formData.bio}
                onChange={handleChange}
                maxLength={500}
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                placeholder="Tell others about yourself..."
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {formData.bio.length}/500
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={isSaving}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSaving}
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSaving ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default Profile;