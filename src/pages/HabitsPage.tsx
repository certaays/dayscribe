import React, { useState } from 'react';
import { useHabits, type HabitWithStatus } from '../hooks/useHabits';
import type { Habit } from '../db/database';
import { formatDate } from '../utils/dateHelpers';
import {
  HabitIcon,
  HABIT_ICON_PRESETS,
  IDENTITY_PRESETS,
  STACK_TRIGGER_PRESETS,
  Flame,
  Sparkles,
  Pencil,
  Trash2,
  Plus,
  Minus,
  Check,
  Target,
  X,
  ShieldAlert,
  Link2,
  UserCheck,
  Zap,
  TrendingUp,
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
    identityStats,
    totalIdentityVotesToday,
    neverMissTwiceHabits,
    toggleHabit,
    incrementCount,
    createHabit,
    updateHabit,
    deleteHabit,
    toggleActive,
  } = useHabits();

  const [activeTab, setActiveTab] = useState<CategoryFilter>('All');
  const [activeIdentityFilter, setActiveIdentityFilter] = useState<string>('All');
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

  // Atomic Habits Blueprint Form fields
  const [formIdentity, setFormIdentity] = useState('');
  const [formStackTrigger, setFormStackTrigger] = useState('');
  const [formTwoMinuteRule, setFormTwoMinuteRule] = useState('');

  const openCreateModal = () => {
    setEditingHabit(null);
    setFormTitle('');
    setFormEmoji('water');
    setFormCategory('Health');
    setFormType('boolean');
    setFormTargetCount(1);
    setFormUnit('');
    setFormDays([0, 1, 2, 3, 4, 5, 6]);
    setFormIdentity('Healthy & Energized Person');
    setFormStackTrigger('After I pour my morning tea / coffee ☕');
    setFormTwoMinuteRule('');
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
    setFormIdentity(h.identity || '');
    setFormStackTrigger(h.stackTrigger || '');
    setFormTwoMinuteRule(h.twoMinuteRule || '');
    setModalOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) return;

    const habitData = {
      title: formTitle.trim(),
      emoji: formEmoji,
      category: formCategory,
      targetType: formType,
      targetCount: formType === 'count' ? Math.max(1, formTargetCount) : 1,
      unit: formType === 'count' ? formUnit.trim() : undefined,
      repeatDays: formDays,
      identity: formIdentity.trim() || undefined,
      stackTrigger: formStackTrigger.trim() || undefined,
      twoMinuteRule: formTwoMinuteRule.trim() || undefined,
    };

    if (editingHabit) {
      await updateHabit(editingHabit.id, habitData);
    } else {
      await createHabit({
        ...habitData,
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

  // Distinct identities present in habits
  const availableIdentities = Array.from(
    new Set(habits.map((h) => h.identity?.trim()).filter(Boolean))
  ) as string[];

  const filteredHabits = habits.filter((h) => {
    if (activeTab !== 'All' && h.category !== activeTab) return false;
    if (activeIdentityFilter !== 'All' && h.identity !== activeIdentityFilter) return false;
    return true;
  });

  return (
    <div className="habits-page">
      {/* Page header */}
      <header className="habits-header animate-fadeInUp">
        <div className="habits-header-info">
          <div className="habits-badge">
            <Sparkles size={13} /> Atomic Habit System
          </div>
          <h1 className="habits-title">Habit Tracker &amp; Identity</h1>
          <p className="habits-subtitle">
            "Every action you take is a vote for the type of person you wish to become." — James Clear
          </p>
        </div>
        <button className="btn-new-habit" onClick={openCreateModal}>
          <Plus size={16} /> New Habit
        </button>
      </header>

      {/* Never Miss Twice Recovery Banner */}
      {neverMissTwiceHabits.length > 0 && (
        <section className="never-miss-twice-banner animate-fadeInDown">
          <div className="nmt-icon-box">
            <ShieldAlert size={22} className="nmt-shield" />
          </div>
          <div className="nmt-content">
            <div className="nmt-header-row">
              <h3 className="nmt-title">Never Miss Twice Alert</h3>
              <span className="nmt-rule-tag">Atomic Rule #4</span>
            </div>
            <p className="nmt-desc">
              Missing once is an accident. Missing twice is the start of a new habit. Reclaim your momentum today with:
            </p>
            <div className="nmt-habits-row">
              {neverMissTwiceHabits.map((h) => (
                <div key={h.id} className="nmt-habit-chip">
                  <HabitIcon icon={h.emoji} size={15} />
                  <span className="nmt-habit-name">{h.title}</span>
                  {h.twoMinuteRule ? (
                    <button
                      className="nmt-quick-btn two-min"
                      onClick={() => toggleHabit(h.id, true)}
                      title={`Do 2-min starter: ${h.twoMinuteRule}`}
                    >
                      <Zap size={12} /> 2-Min Starter
                    </button>
                  ) : (
                    <button
                      className="nmt-quick-btn"
                      onClick={() => toggleHabit(h.id)}
                    >
                      <Check size={12} /> Complete
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Progress & Streaks Stats Card */}
      <section className="habits-stats-banner animate-fadeInUp delay-1">
        {/* Stat 1: Today's Focus */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <Target size={18} color="#e8a84c" />
            </span>
            <span className="stat-title">Today's Focus</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">{completedTodayCount}/{totalTodayCount}</span>
            <span className="stat-desc">rituals complete</span>
          </div>
          <div className="stat-progress-bar">
            <div
              className="stat-progress-fill"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          <span className="stat-pct-text">{progressPercent}% done for {formatDate(new Date(), { weekday: 'short', month: 'short', day: 'numeric' })}</span>
        </div>

        {/* Stat 2: Identity Votes Cast (Atomic Habits) */}
        <div className="stat-card identity-stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <UserCheck size={18} color="#38bdf8" />
            </span>
            <span className="stat-title">Identity Votes Cast</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">{totalIdentityVotesToday}</span>
            <span className="stat-desc">votes for future self</span>
          </div>
          <div className="identity-pills-mini">
            {identityStats.slice(0, 2).map((s) => (
              <span key={s.identity} className="id-mini-chip">
                {s.identity}: {s.completedToday}/{s.totalHabits}
              </span>
            ))}
          </div>
        </div>

        {/* Stat 3: Best Streak */}
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
            {bestStreak > 0 ? 'Consistency is compounding!' : 'Start your first streak today!'}
          </p>
        </div>

        {/* Stat 4: 1% Compounding Metric */}
        <div className="stat-card">
          <div className="stat-header">
            <span className="stat-icon">
              <TrendingUp size={18} color="#4ade80" />
            </span>
            <span className="stat-title">1% Daily Growth</span>
          </div>
          <div className="stat-main">
            <span className="stat-big-number">1.01<sup>365</sup></span>
            <span className="stat-desc">= 37.8x in a year</span>
          </div>
          <p className="stat-motivation">
            Small daily habits compound into remarkable results.
          </p>
        </div>
      </section>

      {/* Category Tabs */}
      <div className="habits-tabs-row animate-fadeInUp delay-2">
        <div className="habits-tabs">
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

        {availableIdentities.length > 0 && (
          <div className="identity-filter-row">
            <span className="id-filter-label">
              <UserCheck size={13} /> Identity:
            </span>
            <select
              value={activeIdentityFilter}
              onChange={(e) => setActiveIdentityFilter(e.target.value)}
              className="id-filter-select"
            >
              <option value="All">All Identities ({habits.length})</option>
              {availableIdentities.map((id) => (
                <option key={id} value={id}>{id}</option>
              ))}
            </select>
          </div>
        )}
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
              onToggleTwoMinute={() => toggleHabit(habit.id, true)}
              onIncrement={(delta) => incrementCount(habit.id, delta)}
              onEdit={() => openEditModal(habit)}
              onDelete={() => deleteHabit(habit.id)}
              onToggleActive={() => toggleActive(habit.id)}
            />
          ))}
        </div>
      )}

      {/* Add / Edit Habit Modal with Atomic Habits Blueprint */}
      {modalOpen && (
        <div className="modal-overlay" onClick={() => setModalOpen(false)}>
          <div className="modal-box modern-habit-modal animate-fadeInUp" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-header-text">
                <h2 className="modal-title">{editingHabit ? 'Edit Habit' : 'Create Atomic Habit'}</h2>
                <span className="modal-subtitle">Build habits that compound with the 4 Laws of Behavior Change</span>
              </div>
              <button className="modal-close-btn" onClick={() => setModalOpen(false)} aria-label="Close modal">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSave} className="habit-form-scrollable">
              {/* Section 1: Habit Core Info */}
              <div className="modal-section-card">
                <div className="title-icon-combined-row">
                  <div className="icon-selector-column">
                    <span className="micro-label">Icon</span>
                    <div className="icon-selector-preview">
                      <HabitIcon icon={formEmoji} size={24} />
                    </div>
                  </div>
                  <div className="title-input-column">
                    <span className="micro-label">Habit Name</span>
                    <input
                      type="text"
                      value={formTitle}
                      onChange={(e) => setFormTitle(e.target.value)}
                      placeholder="e.g., Read 15 mins, Morning Walk, Journal..."
                      className="form-input habit-title-input"
                      required
                      autoFocus
                    />
                  </div>
                </div>

                {/* Icon quick presets */}
                <div className="icon-presets-strip">
                  {HABIT_ICON_PRESETS.map((preset) => {
                    const IconComp = preset.icon;
                    const isSelected = formEmoji === preset.id || formEmoji === preset.label;
                    return (
                      <button
                        type="button"
                        key={preset.id}
                        className={`icon-preset-btn ${isSelected ? 'active' : ''}`}
                        onClick={() => setFormEmoji(preset.id)}
                        title={preset.label}
                      >
                        <IconComp size={16} color={preset.color} />
                      </button>
                    );
                  })}
                </div>

                {/* Category Selection */}
                <div className="form-group mt-2">
                  <span className="micro-label">Category</span>
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
              </div>

              {/* Section 2: Atomic Habits Blueprint */}
              <div className="modal-section-card atomic-blueprint-card">
                <div className="blueprint-header">
                  <Sparkles size={15} color="var(--color-amber)" />
                  <span className="blueprint-title">Atomic Habits Blueprint</span>
                  <span className="blueprint-tag">James Clear</span>
                </div>

                {/* Law 1: Identity Anchor */}
                <div className="blueprint-item">
                  <label className="blueprint-label">
                    <UserCheck size={14} color="#38bdf8" />
                    <span>Identity Anchor <em>(Who do you wish to become?)</em></span>
                  </label>
                  <input
                    type="text"
                    value={formIdentity}
                    onChange={(e) => setFormIdentity(e.target.value)}
                    placeholder="e.g., Mindful Thinker, Lifelong Learner, Healthy Person"
                    className="form-input blueprint-input"
                  />
                  <div className="preset-chips-strip">
                    {IDENTITY_PRESETS.map((idPreset) => (
                      <button
                        type="button"
                        key={idPreset}
                        className={`mini-preset-chip ${formIdentity === idPreset ? 'active' : ''}`}
                        onClick={() => setFormIdentity(idPreset)}
                      >
                        {idPreset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Law 2: Habit Stacking */}
                <div className="blueprint-item">
                  <label className="blueprint-label">
                    <Link2 size={14} color="#fbbf24" />
                    <span>Habit Stacking Cue <em>(Make it Obvious)</em></span>
                  </label>
                  <input
                    type="text"
                    value={formStackTrigger}
                    onChange={(e) => setFormStackTrigger(e.target.value)}
                    placeholder="After [Current Routine], I will [New Habit]"
                    className="form-input blueprint-input"
                  />
                  <div className="preset-chips-strip">
                    {STACK_TRIGGER_PRESETS.slice(0, 4).map((triggerPreset) => (
                      <button
                        type="button"
                        key={triggerPreset}
                        className={`mini-preset-chip ${formStackTrigger === triggerPreset ? 'active' : ''}`}
                        onClick={() => setFormStackTrigger(triggerPreset)}
                      >
                        {triggerPreset}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Law 3: 2-Minute Rule */}
                <div className="blueprint-item">
                  <label className="blueprint-label">
                    <Zap size={14} color="#f97316" />
                    <span>The 2-Minute Rule <em>(Micro starter on low-energy days)</em></span>
                  </label>
                  <input
                    type="text"
                    value={formTwoMinuteRule}
                    onChange={(e) => setFormTwoMinuteRule(e.target.value)}
                    placeholder="e.g., Read 1 single page, Put on shoes, Drink 1 glass..."
                    className="form-input blueprint-input"
                  />
                </div>
              </div>

              {/* Section 3: Goal Type & Repeat Schedule */}
              <div className="modal-section-card">
                <div className="modal-grid-2col">
                  {/* Goal Type */}
                  <div className="form-group">
                    <span className="micro-label">Goal Target Type</span>
                    <div className="type-toggle-row">
                      <button
                        type="button"
                        className={`type-toggle-btn ${formType === 'boolean' ? 'active' : ''}`}
                        onClick={() => setFormType('boolean')}
                      >
                        <Check size={14} /> Yes / No Check
                      </button>
                      <button
                        type="button"
                        className={`type-toggle-btn ${formType === 'count' ? 'active' : ''}`}
                        onClick={() => setFormType('count')}
                      >
                        <Target size={14} /> Counter
                      </button>
                    </div>

                    {formType === 'count' && (
                      <div className="counter-inputs-inline mt-2">
                        <input
                          type="number"
                          min={1}
                          max={999}
                          value={formTargetCount}
                          onChange={(e) => setFormTargetCount(Number(e.target.value))}
                          className="form-input counter-num-input"
                          placeholder="Target"
                          required
                        />
                        <input
                          type="text"
                          placeholder="unit (e.g., glasses)"
                          value={formUnit}
                          onChange={(e) => setFormUnit(e.target.value)}
                          className="form-input counter-unit-input"
                        />
                      </div>
                    )}
                  </div>

                  {/* Repeat Days */}
                  <div className="form-group">
                    <span className="micro-label">Repeat Schedule</span>
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
                </div>
              </div>

              {/* Sticky Modal Action Footer */}
              <div className="modal-footer-sticky">
                <button
                  type="button"
                  className="btn-modal-cancel"
                  onClick={() => setModalOpen(false)}
                >
                  Cancel
                </button>
                <button type="submit" className="btn-modal-submit">
                  {editingHabit ? 'Save Habit Changes' : 'Create Atomic Habit'}
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
// Individual Habit Card Component with Atomic Features
// ----------------------------------------------------
interface HabitCardProps {
  habit: HabitWithStatus;
  onToggle: () => void;
  onToggleTwoMinute: () => void;
  onIncrement: (delta: number) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggleActive: () => void;
}

function HabitCard({
  habit,
  onToggle,
  onToggleTwoMinute,
  onIncrement,
  onEdit,
  onDelete,
}: HabitCardProps) {
  const isDone = habit.completed;
  const progressRatio = habit.targetType === 'count' && habit.targetCount > 0
    ? Math.min(1, habit.currentCount / habit.targetCount)
    : isDone ? 1 : 0;

  return (
    <div
      className={`habit-card ${isDone ? 'completed' : ''} ${!habit.isActive ? 'paused' : ''} ${habit.missedYesterday && !isDone ? 'missed-yesterday' : ''}`}
    >
      {/* Never Miss Twice highlight tag */}
      {habit.missedYesterday && !isDone && (
        <div className="card-recovery-tag" title="Protect your habit identity: Never miss twice!">
          <ShieldAlert size={12} />
          <span>Comeback day · Never miss twice</span>
        </div>
      )}

      {/* Top Header */}
      <div className="habit-card-top">
        <span className="habit-card-emoji">
          <HabitIcon icon={habit.emoji} size={22} />
        </span>
        <div className="habit-card-meta">
          <div className="habit-card-tags-line">
            <span className="habit-card-category">{habit.category}</span>
            {habit.identity && (
              <span className="habit-card-identity" title={`Identity: ${habit.identity}`}>
                <UserCheck size={10} /> {habit.identity}
              </span>
            )}
          </div>
          <h3 className="habit-card-title" title={habit.title}>{habit.title}</h3>
        </div>
        <div className="habit-card-actions">
          <button className="habit-action-btn" onClick={onEdit} title="Edit habit" aria-label="Edit habit">
            <Pencil size={14} />
          </button>
          <button className="habit-action-btn delete" onClick={onDelete} title="Delete habit" aria-label="Delete habit">
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Habit Stacking Cue */}
      {habit.stackTrigger && (
        <div className="habit-stack-cue" title="Habit Stack Trigger">
          <Link2 size={12} className="stack-icon" />
          <span className="stack-text">{habit.stackTrigger}</span>
        </div>
      )}

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
              {isDone
                ? habit.isTwoMinuteVersion
                  ? 'Completed via 2-Min Rule ✓'
                  : 'Completed today ✓'
                : 'Tap to cast your vote'}
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

      {/* 2-Minute Rule Starter Shortcut (if not yet completed) */}
      {!isDone && habit.twoMinuteRule && (
        <div className="two-min-shortcut">
          <button
            className="two-min-btn"
            onClick={onToggleTwoMinute}
            title="Complete 2-minute starter step"
          >
            <Zap size={12} />
            <span className="two-min-label">2-Min Starter:</span>
            <span className="two-min-text">"{habit.twoMinuteRule}"</span>
          </button>
        </div>
      )}

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


