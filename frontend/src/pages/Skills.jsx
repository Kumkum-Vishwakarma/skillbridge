import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import {
  getAllSkills,
  getMySkills,
  createSkill,
  addTeachingSkill,
  addLearningSkill,
  removeTeachingSkill,
  removeLearningSkill,
} from "../api/skillService.js";
import Loader from "../components/common/Loader.jsx";

const SKILL_CATEGORIES = [
  "Programming",
  "Design",
  "Business",
  "Marketing",
  "Language",
  "Music",
  "Other",
];

const Skills = () => {
  const [allSkills, setAllSkills] = useState([]);
  const [teachingSkills, setTeachingSkills] = useState([]);
  const [learningSkills, setLearningSkills] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Tracks which single skill button is mid-request, so only that specific
  // button disables/shows a loading label instead of freezing the whole page.
  const [actionSkillId, setActionSkillId] = useState(null);

  const [createForm, setCreateForm] = useState({
    name: "",
    category: SKILL_CATEGORIES[0],
    description: "",
  });
  const [formError, setFormError] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const loadCatalog = async () => {
    const response = await getAllSkills();
    setAllSkills(response.data);
  };

  const loadMySkills = async () => {
    const response = await getMySkills();
    setTeachingSkills(response.data.teachingSkills);
    setLearningSkills(response.data.learningSkills);
  };

  useEffect(() => {
    const loadAll = async () => {
      try {
        await Promise.all([loadCatalog(), loadMySkills()]);
      } catch (error) {
        // axiosInstance's response interceptor already showed an error toast.
      } finally {
        setIsLoading(false);
      }
    };

    loadAll();
  }, []);

  const isInTeaching = (skillId) =>
    teachingSkills.some((skill) => skill._id === skillId);

  const isInLearning = (skillId) =>
    learningSkills.some((skill) => skill._id === skillId);

  const handleCreateChange = (e) => {
    setCreateForm((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    setFormError("");

    const trimmedName = createForm.name.trim();

    // Client-side mirror of Step 5's backend validation rules — instant
    // feedback before a request is sent; the backend remains authoritative.
    if (trimmedName.length < 2 || trimmedName.length > 50) {
      setFormError("Skill name must be between 2 and 50 characters.");
      return;
    }
    if (!SKILL_CATEGORIES.includes(createForm.category)) {
      setFormError("Please select a valid category.");
      return;
    }
    if (createForm.description.length > 300) {
      setFormError("Description cannot exceed 300 characters.");
      return;
    }

    setIsCreating(true);
    try {
      await createSkill({
        name: trimmedName,
        category: createForm.category,
        description: createForm.description,
      });
      toast.success(`"${trimmedName}" added to the skill catalog`);
      setCreateForm({ name: "", category: SKILL_CATEGORIES[0], description: "" });
      await loadCatalog();
    } catch (error) {
      // Duplicate-name or validation errors are already toasted by
      // axiosInstance's response interceptor.
    } finally {
      setIsCreating(false);
    }
  };

  const handleAddTeaching = async (skillId) => {
    setActionSkillId(skillId);
    try {
      await addTeachingSkill(skillId);
      toast.success("Added to your teaching list");
      await loadMySkills();
    } catch (error) {
      // Toasted centrally (e.g. "Skill already in your teaching list").
    } finally {
      setActionSkillId(null);
    }
  };

  const handleAddLearning = async (skillId) => {
    setActionSkillId(skillId);
    try {
      await addLearningSkill(skillId);
      toast.success("Added to your learning list");
      await loadMySkills();
    } catch (error) {
      // Toasted centrally.
    } finally {
      setActionSkillId(null);
    }
  };

  const handleRemoveTeaching = async (skillId) => {
    setActionSkillId(skillId);
    try {
      await removeTeachingSkill(skillId);
      toast.success("Removed from your teaching list");
      // Deliberate refetch rather than trusting the mutation response —
      // removeTeachingSkill's backend response returns unpopulated IDs
      // (see Architecture Explanation above), so a full refresh is what
      // guarantees the UI always renders correct, populated skill data.
      await loadMySkills();
    } catch (error) {
      // Toasted centrally.
    } finally {
      setActionSkillId(null);
    }
  };

  const handleRemoveLearning = async (skillId) => {
    setActionSkillId(skillId);
    try {
      await removeLearningSkill(skillId);
      toast.success("Removed from your learning list");
      await loadMySkills();
    } catch (error) {
      // Toasted centrally.
    } finally {
      setActionSkillId(null);
    }
  };

  if (isLoading) {
    return <Loader />;
  }

  return (
    <div className="mx-auto max-w-5xl">
      <h1 className="text-2xl font-bold text-gray-900">My Skills</h1>
      <p className="mt-1 text-sm text-gray-500">
        Manage what you teach, what you want to learn, and contribute new
        skills to the SkillBridge catalog.
      </p>

      {/* ── My Teaching / Learning Lists ─────────────────────────── */}
      <div className="mt-6 grid grid-cols-1 gap-6 md:grid-cols-2">
        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            I Teach
          </h2>
          {teachingSkills.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              You haven't added any teaching skills yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {teachingSkills.map((skill) => (
                <li
                  key={skill._id}
                  className="flex items-center justify-between rounded-md bg-blue-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {skill.name}
                    </p>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveTeaching(skill._id)}
                    disabled={actionSkillId === skill._id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionSkillId === skill._id ? "Removing..." : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div className="rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
            I Want to Learn
          </h2>
          {learningSkills.length === 0 ? (
            <p className="mt-3 text-sm text-gray-400">
              You haven't added any learning skills yet.
            </p>
          ) : (
            <ul className="mt-3 flex flex-col gap-2">
              {learningSkills.map((skill) => (
                <li
                  key={skill._id}
                  className="flex items-center justify-between rounded-md bg-purple-50 px-3 py-2"
                >
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {skill.name}
                    </p>
                    <p className="text-xs text-gray-500">{skill.category}</p>
                  </div>
                  <button
                    onClick={() => handleRemoveLearning(skill._id)}
                    disabled={actionSkillId === skill._id}
                    className="text-xs font-medium text-red-500 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {actionSkillId === skill._id ? "Removing..." : "Remove"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {/* ── Add New Skill to Catalog ─────────────────────────────── */}
      <div className="mt-6 rounded-lg border border-gray-200 bg-white p-5 shadow-sm">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Add a New Skill to the Catalog
        </h2>

        {formError && (
          <div className="mt-3 rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
            {formError}
          </div>
        )}

        <form
          onSubmit={handleCreateSubmit}
          className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2"
        >
          <input
            name="name"
            type="text"
            value={createForm.name}
            onChange={handleCreateChange}
            placeholder="Skill name (e.g. React)"
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          />
          <select
            name="category"
            value={createForm.category}
            onChange={handleCreateChange}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500"
          >
            {SKILL_CATEGORIES.map((category) => (
              <option key={category} value={category}>
                {category}
              </option>
            ))}
          </select>
          <input
            name="description"
            type="text"
            value={createForm.description}
            onChange={handleCreateChange}
            placeholder="Short description (optional)"
            maxLength={300}
            className="rounded-md border border-gray-300 px-3 py-2 text-sm focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 sm:col-span-2"
          />
          <button
            type="submit"
            disabled={isCreating}
            className="rounded-md bg-blue-600 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60 sm:col-span-2"
          >
            {isCreating ? "Adding..." : "Add Skill"}
          </button>
        </form>
      </div>

      {/* ── Browse Full Catalog ──────────────────────────────────── */}
      <div className="mt-6">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-gray-500">
          Skill Catalog
        </h2>

        {allSkills.length === 0 ? (
          <p className="mt-3 text-sm text-gray-400">
            No skills in the catalog yet. Add the first one above.
          </p>
        ) : (
          <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {allSkills.map((skill) => {
              const alreadyTeaching = isInTeaching(skill._id);
              const alreadyLearning = isInLearning(skill._id);
              const isBusy = actionSkillId === skill._id;

              return (
                <div
                  key={skill._id}
                  className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm"
                >
                  <p className="font-medium text-gray-900">{skill.name}</p>
                  <p className="text-xs text-gray-500">{skill.category}</p>
                  {skill.description && (
                    <p className="mt-1 text-sm text-gray-600">
                      {skill.description}
                    </p>
                  )}

                  <div className="mt-3 flex gap-2">
                    <button
                      onClick={() => handleAddTeaching(skill._id)}
                      disabled={alreadyTeaching || isBusy}
                      className="flex-1 rounded-md bg-blue-50 px-2 py-1.5 text-xs font-medium text-blue-600 transition hover:bg-blue-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {alreadyTeaching ? "Teaching ✓" : "I Teach This"}
                    </button>
                    <button
                      onClick={() => handleAddLearning(skill._id)}
                      disabled={alreadyLearning || isBusy}
                      className="flex-1 rounded-md bg-purple-50 px-2 py-1.5 text-xs font-medium text-purple-600 transition hover:bg-purple-100 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {alreadyLearning ? "Learning ✓" : "I Want This"}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Skills;