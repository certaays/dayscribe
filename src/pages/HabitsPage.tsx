import React, { useState } from 'react';
import { useHabits, type HabitWithStatus } from '../hooks/useHabits';
import type { Habit } from '../db/database';
import { formatDate } from '../utils/dateHelpers';
import {
  HabitIcon,
  HABIT_ICON_PRESETS,
  Flame,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  Minus,
  Check,
  Target,
  Activity,
  X,
} from '../components/icons/AppIcons';
import './HabitsPage.css';

const CATEGORIES = ['All', 'Health', 'Mind', 'Growth', 'Productivity', 'Other'] as const;
type CategoryFilter = typeof CATEGORIES[number];

const DAY_ABBR = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export function HabitsPage() {
  const {
    habits,
    completedTodayCount,
    totalTodayCount,
    progressPercent,
    bestStreak,
    loading,
    toggleHabit,
    incrementCount,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleActive,
  } = useHabits();

  const [activeTab, setActiveTab] = useState<CategoryFilter>('All');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingHabit, setEditingHabit] = useState<Habit | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formEmoji, setFormEmoji] = useState('water');
  const [formCategory, setFormCategory] = useState<Habit['category']>('Health');
  const [formType, setFormType] = useState<'boolean' | 'count'>('boolean');
  const [formTargetCount, setFormTargetCount] = useState(1);
  const [formUnit, setFormUnit] = useState('');
  const [formDays, setFormDays] = useState<number[]>([0, 1, 2, 3, 4, 5, 6]);

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormEmoji('water');
    setFormCategory('Health');
    setFormType('boolean');
    setFormTargetCount(1);
    setFormUnit('');
    setFormDays([0, 1, 2, 3, 4, 5, 6]);
    setModalOpen(true);
  };

  const openEditModal = (h: Habit) => {
    setEditingHabit(h);
    setFormTitle(h.title);
    setFormEmoji(h.emoji);
    setFormCategory(h.category);
    setFormType(h.targetType);
    setFormTargetCount(h.targetCount);
    setFormUnit(h.unit || '');
    setFormDays(h.repeatDays);
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    if (editingHabit) {
      await updateHabit(editingHabit.id, {
        title: formTitle.trim(),
        emoji: formEmoji,
        category: formCategory,
        targetType: formType,
        targetCount: formType === 'count' ? Math.max(1, formTargetCount) : 1,
        unit: formType === 'count' ? formUnit.trim() : undefined,
        repeatDays: formDays,
      });
    } else {
      await createHabit({
        title: formTitle.trim(),
        emoji: formEmoji,
        category: formCategory,
        targetType: formType,
        targetCount: formType === 'count' ? Math.max(1, formTargetCount) : 1,
        unit: formType === 'count' ? formUnit.trim() : undefined,
        repeatDays: formDays,
        isActive: true,
      });
    }

    setModalOpen(false);
  };

  const toggleDay = (d: number) => {
    setFormDays((prev) =>
      prev.includes(d) ? prev.filter((x) => x !== d) : [...prev, d].sort((a, b) => a - b)
    );
  };

  const filteredHabits = habits.filter((h) => {
    if (activeTab === 'All') return true;
    return h.category === activeTab;
  });

  return (
    <div className="habits-page">
      {/* Page header */}
      <header className="habits-header animate-fadeInUp">
        <div className="habits-header-info">
          <div className="habits-badge">Daily Rituals</div>
          <h1 className="habits-title">Habit Tracker</h1>
          <p className="habits-subtitle">
            Small, intentional habits practiced daily quietly shape who you become.
          </p>
        </div>
        <button className="btn-new-habit" onClick={openCreateModal}>
          <Plus size={16} /> New Habit
        </button>
      </header>

      {/* Progress & Streaks Stats Card */}
      <section className="habits-stats-banner animate-fadeInUp delay-1">
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <Target size={18} color="#e8a84c" />
            </span>
            <span className="stat-title">Today's Focus</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">{completedTodayCount}/{totalTodayCount}</span>
            <span className="stat-desc">habits completed</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="stat-pct-text">{progressPercent}% done for {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <Flame size={18} color="#f97316" />
            </span>
            <span className="stat-title">Best Streak</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">{bestStreak}</span>
            <span className="stat-desc">consecutive days</span>
          </div>
          <p className="stat-motivation">
            {bestStreak > 0 ? 'Consistency is your superpower!' : 'Start your first streak today!'}
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <Activity size={18} color="#38bdf8" />
            </span>
            <span className="stat-title">Active Habits</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">{habits.filter((h) => h.isActive).length}</span>
            <span className="stat-desc">rituals tracked</span>
          </div>
          <p className="stat-motivation">
            {habits.length === 0 ? 'Create a habit to get started' : 'Cultivating mindful living'}
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="habits-tabs animate-fadeInUp delay-2">
        {CATEGORIES.map((cat) => (
          <button
            key={cat}
            className={`habit-tab ${activeTab === cat ? 'active' : ''}`}
            onClick={() => setActiveTab(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Habits List */}
      {loading ? (
        <div className="habits-loading">
          <Sparkles size={24} className="animate-spin text-amber" />
          <p>Loading your rituals...</p>
        </div>
      ) : filteredHabits.length === 0 ? (
        <div className="habits-empty-state animate-fadeInUp">
          <span className="empty-emoji">
            <Sparkles size={36} color="var(--color-amber)" />
          </span>
          <h3>No habits found in {activeTab}</h3>
          <p>Begin tracking small daily habits and watch your growth compound.</p>
          <button className="btn-new-habit" onClick={openCreateModal}>
            <Plus size={16} /> Create Your First Habit
          </button>
        </div>
      ) : (
        <div className="habits-grid animate-fadeInUp delay-3">
          {filteredHabits.map((habit) => (
            <HabitCard
              key={habit.id}
              habit={habit}
              onToggle={() => toggleHabit(habit.id)}
              onIncrement={(delta) => incrementCount(habit.id, delta)}
              onEdit={() => openEditModal(habit)}
              onDelete={() => deleteHabit(habit.id)}
              onToggleActive={() => toggleActive(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Habit Modal */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2 className="modal-title">{editingHabit ? 'Edit Habit' : 'Create New Habit'}</h2>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <form onSubmit={handleSave} className="habit-form">
              {/* Icon & Title */}
              <div className="form-group">
                <label className="form-label">Habit Icon &amp; Title</label>
                <div className="title-input-row">
                  <div className="emoji-input-wrap">
                    <HabitIcon icon={formEmoji} size={22} />
                  </div>
                  <input
                    type="text"
                    value={formTitle}
                    onChange={(e) => setFormTitle(e.target.value)}
                    placeholder="e.g., Drink 8 glasses of water"
                    className="form-input text-input"
                    required
                    autoFocus
                  />
                </div>
                {/* Icon quick presets */}
                <div className="emoji-presets">
                  {HABIT_ICON_PRESETS.map((preset) => {
                    const IconComp = preset.icon;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        className={`emoji-pill ${formEmoji === preset.id || formEmoji === preset.label ? 'active' : ''}`}
                        onClick={() => setFormEmoji(preset.id)}
                        title={preset.label}
                      >
                        <IconComp size={16} color={preset.color} />
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Category */}
              <div className="form-group">
                <label className="form-label">Category</label>
                <div className="category-pills">
                  {(['Health', 'Mind', 'Growth', 'Productivity', 'Other'] as const).map((cat) => (
                    <button
                      type="button"
                      key={cat}
                      className={`category-pill ${formCategory === cat ? 'active' : ''}`}
                      onClick={() => setFormCategory(cat)}
                    >
                      {cat}
                    </button>
                  ))}
                </div>
              </div>

              {/* Target Type */}
              <div className="form-group">
                <label className="form-label">Goal Type</label>
                <div className="type-toggle-row">
                  <button
                    type="button"
                    className={`type-toggle-btn ${formType === 'boolean' ? 'active' : ''}`}
                    onClick={() => setFormType('boolean')}
                  >
                    <Check size={15} /> Yes / No Checkbox
                  </button>
                  <button
                    type="button"
                    className={`type-toggle-btn ${formType === 'count' ? 'active' : ''}`}
                    onClick={() => setFormType('count')}
                  >
                    <Target size={15} /> Daily Target Counter
                  </button>
                </div>
              </div>

              {/* Counter Config */}
              {formType === 'count' && (
                <div className="form-row-2">
                  <div className="form-group">
                    <label className="form-label">Target Count</label>
                    <input
                      type="number"
                      min={1}
                      max={999}
                      value={formTargetCount}
                      onChange={(e) => setFormTargetCount(Number(e.target.value))}
                      className="form-input"
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Unit (optional)</label>
                    <input
                      type="text"
                      placeholder="glasses, mins, pages..."
                      value={formUnit}
                      onChange={(e) => setFormUnit(e.target.value)}
                      className="form-input"
                    />
                  </div>
                </div>
              )}

              {/* Repeat Days */}
              <div className="form-group">
                <label className="form-label">Repeat on Days</label>
                <div className="days-picker">
                  {DAY_ABBR.map((label, index) => {
                    const isSelected = formDays.includes(index);
                    return (
                      <button
                        type="button"
                        key={index}
                        className={`day-btn ${isSelected ? 'selected' : ''}`}
                        onClick={() => toggleDay(index)}
                      >
                        {label}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Form Buttons */}
              <div className="modal-actions">
                <button
                  type="button"
                  className="btn-secondary"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-primary">
                  {editingHabit ? 'Save Changes' : 'Create Habit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

// ----------------------------------------------------
// Individual Habit Card Component
// ----------------------------------------------------
interface HabitCardProps {
  habit: HabitWithStatus;
  onToggle: () => void;
  onIncrement: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function HabitCard({
  habit,
  onToggle,
  onIncrement,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const isDone = habit.completed;
  const progressRatio = habit.targetType === 'count' && habit.targetCount > 0
    ? Math.min(1, habit.currentCount / habit.targetCount)
    : isDone ? 1 : 0;

  return (
    <div className={`habit-card ${isDone ? 'completed' : ''} ${!habit.isActive ? 'paused' : ''}`}>
      {/* Top Header */}
      <div className="habit-card-top">
        <span className="habit-card-emoji">
          <HabitIcon icon={habit.emoji} size={22} />
        </span>
        <div className="habit-card-meta">
          <span className="habit-card-category">{habit.category}</span>
          <h3 className="habit-card-title" title={habit.title}>{habit.title}</h3>
        </div>
        <div className="habit-card-actions">
          <button className="habit-action-btn" onClick={onEdit} title="Edit habit" aria-label="Edit habit">
            <Pencil size={15} />
          </button>
          <button className="habit-action-btn delete" onClick={onDelete} title="Delete habit" aria-label="Delete habit">
            <Trash2 size={15} />
          </button>
        </div>
      </div>

      {/* Main Interactive Action */}
      <div className="habit-card-body">
        {habit.targetType === 'boolean' ? (
          <button
            className={`habit-check-trigger ${isDone ? 'checked' : ''}`}
            onClick={onToggle}
          >
            <span className="check-mark">
              {isDone ? <Check size={14} strokeWidth={3} /> : '○'}
            </span>
            <span className="check-text">
              {isDone ? 'Completed today' : 'Tap to complete'}
            </span>
          </button>
        ) : (
          <div className="habit-counter-box">
            <div className="counter-controls">
              <button
                className="counter-btn"
                onClick={() => onIncrement(-1)}
                disabled={habit.currentCount <= 0}
                title="Subtract 1"
              >
                <Minus size={14} />
              </button>
              <div className="counter-status">
                <span className="counter-val">{habit.currentCount}</span>
                <span className="counter-sep">/</span>
                <span className="counter-target">
                  {habit.targetCount} {habit.unit || ''}
                </span>
              </div>
              <button
                className="counter-btn plus"
                onClick={() => onIncrement(1)}
                title="Add 1"
              >
                <Plus size={14} />
              </button>
            </div>
            <div className="counter-progress-bar">
              <div
                className="counter-progress-fill"
                style={{ width: `${progressRatio * 100}%` }}
              />
            </div>
          </div>
        )}
      </div>

      {/* Footer: Streak & 7-Day History Mini-Dots */}
      <div className="habit-card-footer">
        <div className="habit-streak-badge">
          <span className="streak-fire">
            <Flame size={14} />
          </span>
          <span className="streak-num">{habit.streak}</span>
          <span className="streak-unit">day streak</span>
        </div>

        {/* 7-day mini history */}
        <div className="habit-history-dots" title="Past 7 days history">
          {habit.history.map((h, i) => {
            const dayInitial = ['S', 'M', 'T', 'W', 'T', 'F', 'S'][new Date(h.date).getDay()];
            return (
              <div key={i} className="history-dot-wrap">
                <div
                  className={`history-dot ${h.completed ? 'filled' : ''}`}
                  title={`${h.date}: ${h.completed ? 'Completed' : 'Missed'}`}
                />
                <span className="history-day-lbl">{dayInitial}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

