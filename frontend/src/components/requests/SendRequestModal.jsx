import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { getMySkills, getUserSkills } from "../../api/skillService.js";
import { createExchangeRequest } from "../../api/requestService.js";

const SendRequestModal = ({ match, onClose, onSuccess }) => {
  const [myTeachingSkills, setMyTeachingSkills] = useState([]);
  const [theirTeachingSkills, setTheirTeachingSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  const [offeredSkill, setOfferedSkill] = useState("");
  const [requestedSkill, setRequestedSkill] = useState("");
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const loadSkillOptions = async () => {
      try {
        const [mine, theirs] = await Promise.all([
          getMySkills(),
          getUserSkills(match.user._id),
        ]);

        setMyTeachingSkills(mine.data.teachingSkills);
        setTheirTeachingSkills(theirs.data.teachingSkills);

        // Pre-select using the match's own intersection data when
        // available — it's the most relevant default — falling back to
        // the first item in each full list otherwise.
        const defaultOffered =
          match.matchingSkills.iTeachYouWant[0]?._id ||
          mine.data.teachingSkills[0]?._id ||
          "";
        const defaultRequested =
          match.matchingSkills.youTeachIWant[0]?._id ||
          theirs.data.teachingSkills[0]?._id ||
          "";

        setOfferedSkill(defaultOffered);
        setRequestedSkill(defaultRequested);
      } catch (error) {
        // axiosInstance's interceptor already toasted the failure.
      } finally {
        setIsLoading(false);
      }
    };

    loadSkillOptions();
  }, [match]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    if (!offeredSkill) {
      setFormError("Select a skill you're offering.");
      return;
    }
    if (!requestedSkill) {
      setFormError("Select a skill you're requesting.");
      return;
    }
    if (message.length > 500) {
      setFormError("Message cannot exceed 500 characters.");
      return;
    }

    setIsSubmitting(true);
    try {
      await createExchangeRequest({
        receiver: match.user._id,
        offeredSkill,
        requestedSkill,
        message,
      });
      toast.success(`Request sent to ${match.user.name}`);
      onSuccess();
      onClose();
    } catch (error) {
      // Backend rule violations (e.g. duplicate pending request) are
      // already toasted centrally by axiosInstance's interceptor.
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-lg">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-bold text-gray-900">
            Send Request to {match.user.name}
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        {isLoading ? (
          <p className="mt-6 text-center text-sm text-gray-500">
            Loading skill options...
          </p>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 flex flex-col gap-4">
            {formError && (
              <div className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                {formError}
              </div>
            )}

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Skill you'll offer
              </label>
              {myTeachingSkills.length === 0 ? (
                <p className="text-sm text-gray-400">
                  You haven't added any teaching skills yet. Add one on the
                  Skills page first.
                </p>
              ) : (
                <select
                  value={offeredSkill}
                  onChange={(e) => setOfferedSkill(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {myTeachingSkills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Skill you're requesting
              </label>
              {theirTeachingSkills.length === 0 ? (
                <p className="text-sm text-gray-400">
                  {match.user.name} hasn't listed any teaching skills yet.
                </p>
              ) : (
                <select
                  value={requestedSkill}
                  onChange={(e) => setRequestedSkill(e.target.value)}
                  className="w-full rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
                >
                  {theirTeachingSkills.map((skill) => (
                    <option key={skill._id} value={skill._id}>
                      {skill.name}
                    </option>
                  ))}
                </select>
              )}
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-gray-700">
                Message (optional)
              </label>
              <textarea
                rows={3}
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                maxLength={500}
                placeholder="Introduce yourself or suggest a schedule..."
                className="w-full resize-none rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
              />
              <p className="mt-1 text-right text-xs text-gray-400">
                {message.length}/500
              </p>
            </div>

            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                disabled={isSubmitting}
                className="rounded-md bg-gray-100 px-4 py-2 text-sm font-medium text-gray-700 transition hover:bg-gray-200 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={
                  isSubmitting ||
                  myTeachingSkills.length === 0 ||
                  theirTeachingSkills.length === 0
                }
                className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {isSubmitting ? "Sending..." : "Send Request"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default SendRequestModal;