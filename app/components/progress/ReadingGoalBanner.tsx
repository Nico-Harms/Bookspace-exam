import { useState } from "react";
import { Form, useSubmit } from "react-router";

interface ReadingGoalBannerProps {
  goalPagesPerWeek: number;
  pagesReadThisWeek: number;
  daysLeftInWeek: number;
  isEditMode?: boolean;
}

export function ReadingGoalBanner({
  goalPagesPerWeek,
  pagesReadThisWeek,
  daysLeftInWeek,
  isEditMode = false,
}: ReadingGoalBannerProps) {
  const [localGoal, setLocalGoal] = useState(goalPagesPerWeek || 60);
  const [showEditForm, setShowEditForm] = useState(isEditMode);
  const submit = useSubmit();

  // Calculate progress
  const progressPercentage = goalPagesPerWeek
    ? Math.min(100, Math.round((pagesReadThisWeek / goalPagesPerWeek) * 100))
    : 0;

  // Calculate pages left to reach goal
  const pagesLeft = Math.max(0, goalPagesPerWeek - pagesReadThisWeek);

  // Calculate daily pages needed to reach goal
  const dailyPagesNeeded =
    daysLeftInWeek > 0 ? Math.ceil(pagesLeft / daysLeftInWeek) : 0;

  // Get color based on progress - using warm, earthy tones
  const getProgressColor = () => {
    if (progressPercentage >= 100) return "bg-amber-600";
    if (progressPercentage >= 75) return "bg-amber-500";
    if (progressPercentage >= 50) return "bg-amber-400";
    if (progressPercentage >= 25) return "bg-orange-300";
    return "bg-orange-200";
  };

  // Handle form submission
  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    submit(formData, { method: "post" });
    setShowEditForm(false);
  };

  return (
    <div className="mb-8 bg-gradient-to-r from-[#48302D] to-[#6A4A45] rounded-xl shadow-md overflow-hidden">
      <div className="p-6">
        {/* Header with goal info and edit button */}
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-xl font-bold text-amber-50">
            Weekly Reading Goal
          </h2>

          {!showEditForm && (
            <button
              type="button"
              onClick={() => setShowEditForm(true)}
              className="text-amber-200 hover:text-amber-100 text-sm font-medium"
            >
              Edit Goal
            </button>
          )}
        </div>

        {/* Edit form */}
        {showEditForm ? (
          <Form onSubmit={handleSubmit} method="post" className="mb-4">
            <div className="flex flex-col md:flex-row gap-4 items-center">
              <div className="flex-1">
                <label
                  htmlFor="goalPagesPerWeek"
                  className="block text-sm font-medium text-amber-100 mb-1"
                >
                  Pages per week:
                </label>
                <input
                  type="number"
                  id="goalPagesPerWeek"
                  name="goalPagesPerWeek"
                  min="1"
                  value={localGoal}
                  onChange={(e) => setLocalGoal(Number(e.target.value))}
                  className="w-full px-3 py-2 border border-amber-300 bg-amber-50 rounded-md shadow-sm focus:ring-amber-500 focus:border-amber-500"
                />
              </div>
              <div className="flex gap-2">
                <button
                  type="submit"
                  className="px-4 py-2 bg-amber-600 text-white rounded-md hover:bg-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-2"
                >
                  Save
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowEditForm(false);
                    setLocalGoal(goalPagesPerWeek);
                  }}
                  className="px-4 py-2 bg-[#69493E] text-amber-100 rounded-md hover:bg-[#5A3D34] focus:outline-none focus:ring-2 focus:ring-amber-300 focus:ring-offset-2"
                >
                  Cancel
                </button>
              </div>
            </div>
          </Form>
        ) : (
          <>
            {/* Goal display and progress bar */}
            <div className="mb-4">
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-amber-100">
                  Your goal: {goalPagesPerWeek} pages per week
                </span>
                <span className="text-sm font-medium text-amber-100">
                  {progressPercentage}% complete
                </span>
              </div>
              <div className="w-full h-4 bg-[#3A2825] rounded-full overflow-hidden">
                <div
                  className={`h-full transition-all duration-500 ${getProgressColor()}`}
                  style={{ width: `${progressPercentage}%` }}
                ></div>
              </div>
            </div>

            {/* Stats display */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
              <div className="bg-[#5A3D34] p-3 rounded-lg shadow-sm border border-[#69493E]">
                <p className="text-sm text-amber-200">Read this week</p>
                <p className="text-2xl font-bold text-amber-100">
                  {pagesReadThisWeek}
                </p>
                <p className="text-xs text-amber-200/80">pages</p>
              </div>
              <div className="bg-[#5A3D34] p-3 rounded-lg shadow-sm border border-[#69493E]">
                <p className="text-sm text-amber-200">Left to reach goal</p>
                <p className="text-2xl font-bold text-amber-100">{pagesLeft}</p>
                <p className="text-xs text-amber-200/80">pages</p>
              </div>
              <div className="bg-[#5A3D34] p-3 rounded-lg shadow-sm border border-[#69493E]">
                <p className="text-sm text-amber-200">Daily target</p>
                <p className="text-2xl font-bold text-amber-100">
                  {dailyPagesNeeded}
                </p>
                <p className="text-xs text-amber-200/80">pages per day</p>
              </div>
            </div>

            {/* Motivational message */}
            <div className="mt-4 text-center text-sm">
              {progressPercentage >= 100 ? (
                <p className="text-amber-200 font-medium">
                  🎉 Congrats! You've reached your weekly goal!
                </p>
              ) : daysLeftInWeek > 0 ? (
                <p className="text-amber-100">
                  You need to read{" "}
                  <span className="font-bold">{dailyPagesNeeded}</span> pages
                  per day for the next{" "}
                  <span className="font-bold">{daysLeftInWeek}</span> days to
                  reach your goal.
                </p>
              ) : (
                <p className="text-amber-100">
                  New week starting soon! Set a new reading goal to stay on
                  track.
                </p>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
