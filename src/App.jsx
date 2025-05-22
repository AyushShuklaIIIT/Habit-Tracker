import React, { useEffect, useState } from "react";
import { FaSun, FaMoon, FaTrashAlt, FaPlus } from "react-icons/fa";

const getDaysInMonth = (month, year) => {
  const date = new Date(year, month, 1);
  const days = [];
  while (date.getMonth() === month) {
    days.push(new Date(date));
    date.setDate(date.getDate() + 1);
  }
  return days;
};

const countDoneDays = (doneDays, habit) => {
  return Object.keys(doneDays[habit] || {}).filter((d) => doneDays[habit][d]).length;
};

const countDoneDaysInMonth = (doneDays, habit, month, year) => {
  return Object.keys(doneDays[habit] || {}).filter((d) => {
    const date = new Date(d);
    return date.getMonth() === month && date.getFullYear() === year && doneDays[habit][d];
  }).length;
};

const getCurrentStreak = (doneDays, habit) => {
  const today = new Date();
  let streak = 0;
  while (true) {
    const dateStr = today.toDateString();
    if (doneDays[habit]?.[dateStr]) {
      streak++;
      today.setDate(today.getDate() - 1);
    } else {
      break;
    }
  }
  return streak;
};

const getStreakColor = (streak) => {
  if (streak >= 15) return "bg-green-100 border-green-500 text-green-800";
  if (streak >= 5) return "bg-yellow-100 border-yellow-500 text-yellow-800";
  if (streak >= 1) return "bg-red-100 border-red-500 text-red-800";
  return "bg-gray-100 border-gray-300 text-gray-600";
};

const HabitCalendar = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [habitOptions, setHabitOptions] = useState(() => {
    const stored = localStorage.getItem("habitList");
    return stored ? JSON.parse(stored) : ["Exercise"];
  });
  const [habit, setHabit] = useState(habitOptions[0]);
  const [doneDays, setDoneDays] = useState(() => {
    const stored = localStorage.getItem("doneDays");
    return stored ? JSON.parse(stored) : {};
  });
  const [newHabit, setNewHabit] = useState("");

  useEffect(() => {
    localStorage.setItem("doneDays", JSON.stringify(doneDays));
  }, [doneDays]);

  useEffect(() => {
    localStorage.setItem("habitList", JSON.stringify(habitOptions));
  }, [habitOptions]);

  const toggleDay = (dateStr) => {
    setDoneDays((prev) => {
      const updated = { ...prev };
      if (!updated[habit]) updated[habit] = {};
      updated[habit] = { ...updated[habit], [dateStr]: !updated[habit][dateStr] };
      return updated;
    });
  };

  const createHabit = () => {
    const trimmed = newHabit.trim();
    if (trimmed && !habitOptions.includes(trimmed)) {
      setHabitOptions([...habitOptions, trimmed]);
      setHabit(trimmed);
      setNewHabit("");
    }
  };

  const deleteHabit = () => {
    if (!window.confirm(`Delete habit "${habit}"?`)) return;
    const newOptions = habitOptions.filter((h) => h !== habit);
    setHabitOptions(newOptions.length ? newOptions : ["Exercise"]);
    setHabit(newOptions[0] || "Exercise");
    const updatedDays = { ...doneDays };
    delete updatedDays[habit];
    setDoneDays(updatedDays);
  };

  const year = currentDate.getFullYear();
  const month = currentDate.getMonth();
  const days = getDaysInMonth(month, year);
  const currentStreak = getCurrentStreak(doneDays, habit);
  const streakColor = getStreakColor(currentStreak);

  return (
    <div className="max-w-3xl mx-auto p-4">
    <motion.div initial={{ opacity: 0, y: -10}}
    animate={{opacity: 1, y: 0}}
    transition={{duration: 0.3}}
    >
      <h1 className="text-2xl font-bold mb-4">📅 Habit Tracker</h1>
    </motion.div>

      {/* Habit Input */}
      <div className="mb-4 flex items-center gap-2">
        <input
          type="text"
          value={newHabit}
          onChange={(e) => setNewHabit(e.target.value)}
          placeholder="New habit name"
          className="border p-2 rounded w-full max-w-xs focus:ring"
        />
        <button
          onClick={createHabit}
          className="bg-green-600 text-white px-3 py-1 rounded hover:bg-green-700"
        >
          <FaPlus className="inline mr-1"></FaPlus> Add
        </button>
      </div>

      {/* Habit Select and Month Nav */}
      <div className="flex flex-col md:flex-row items-center justify-between gap-4 mb-6 p-4 rounded-lg bg-gray-50 shadow">
        <div className="flex items-center gap-2">
          <label className="font-medium">Habit:</label>
          <select
            value={habit}
            onChange={(e) => setHabit(e.target.value)}
            className="border p-1 rounded focus:ring"
          >
            {habitOptions.map((h) => (
              <option key={h} value={h}>
                {h} ({countDoneDaysInMonth(doneDays, h, month, year)})
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-4">
          <button
            onClick={() => setCurrentDate(new Date(year, month - 1, 1))}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
          >
            ← Previous
          </button>

          <span className="text-lg font-semibold">
            {currentDate.toLocaleString("default", { month: "long" })} {year}
          </span>

          <button
            onClick={() => {
              const nextMonth = new Date(year, month + 1, 1);
              const now = new Date();
              if (nextMonth <= new Date(now.getFullYear(), now.getMonth(), 1)) {
                setCurrentDate(nextMonth);
              }
            }}
            disabled={new Date(year, month + 1, 1) > new Date(new Date().getFullYear(), new Date().getMonth(), 1)}
            className="bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            Next →
          </button>
        </div>
      </div>

      <button
        onClick={deleteHabit}
        className="mb-4 bg-red-500 text-white px-3 py-1 rounded hover:bg-red-600"
      >
        <FaTrashAlt className="inline mr-1"></FaTrashAlt> Delete "{habit}"
      </button>

      {/* Calendar Grid */}
      <div className="grid grid-cols-7 gap-2 text-center">
        {["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].map((d) => (
          <div key={d} className="font-semibold text-gray-600">{d}</div>
        ))}

        {days.map((day) => {
          const dateStr = day.toDateString();
          const isDone = doneDays[habit]?.[dateStr];
          const today = new Date();
          today.setHours(0, 0, 0, 0);
          const dayOnly = new Date(day);
          dayOnly.setHours(0, 0, 0, 0);
          const isFuture = dayOnly > today;

          return (
            <motion.div
              key={dateStr}
              onClick={() => !isFuture && toggleDay(dateStr)}
              className={`rounded-lg border p-2 h-12 flex items-center justify-center transition-all duration-200 select-none
                ${isFuture ? "text-gray-400 bg-gray-100 cursor-not-allowed" : "cursor-pointer"}
                ${isDone ? "bg-green-500 text-white font-bold shadow" : "bg-white hover:bg-green-100"}`}
                whileTap={{scale: 0.9}}
            >
              {day.getDate()}
            </motion.div>
          );
        })}
      </div>

      {/* Stats */}
      <div className={`mt-6 shadow rounded-lg p-4 border ${streakColor}`}>
        <h3 className="text-lg font-semibold mb-2">📊 Stats for "{habit}"</h3>
        <p>
          ✅ <strong>{countDoneDays(doneDays, habit)}</strong> days completed<br />
          🔥 <strong>{currentStreak}</strong> day streak
        </p>
      </div>
    </div>
  );
};

export default HabitCalendar;
