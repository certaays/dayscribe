import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useJournal } from '../hooks/useJournal';
import { formatDate, toDateString, MOODS } from '../utils/dateHelpers';
import { MoodIcon, Check, ArrowLeft, X } from '../components/icons/AppIcons';
import './EditorPage.css';

const AUTO_SAVE_MS = 30_000;

export function EditorPage() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { entries, createEntry, updateEntry } = useJournal();

  const isNew = id === 'new';

  const existing = isNew ? undefined : entries.find((e) => e.id === id);

  const [title, setTitle] = useState(existing?.title ?? '');
  const [content, setContent] = useState(existing?.content ?? '');
  const [mood, setMood] = useState(existing?.mood ?? '');
  const [tags, setTags] = useState<string[]>(existing?.tags ?? []);
  const [tagInput, setTagInput] = useState('');
  const [saved, setSaved] = useState(!isNew);
  const [entryId, setEntryId] = useState<string | null>(isNew ? null : (id ?? null));
  const [saveAnim, setSaveAnim] = useState(false);
  const autoSaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const today = toDateString(new Date());
  const entryDate = existing?.date ?? today;

  const save = useCallback(async () => {
    if (!content.trim() && !title.trim()) return;

    if (!entryId) {
      const created = await createEntry({
        date: today,
        title,
        content,
        mood: mood || '😌',
        tags,
      });
      setEntryId(created.id);
    } else {
      await updateEntry(entryId, { title, content, mood: mood || '😌', tags });
    }
    setSaved(true);
    setSaveAnim(true);
    setTimeout(() => setSaveAnim(false), 1000);
  }, [entryId, title, content, mood, tags, createEntry, updateEntry, today]);

  // Auto-save on content change
  useEffect(() => {
    setSaved(false);
    if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    autoSaveTimer.current = setTimeout(save, AUTO_SAVE_MS);
    return () => {
      if (autoSaveTimer.current) clearTimeout(autoSaveTimer.current);
    };
  }, [title, content, mood, tags]);

  const handleAddTag = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && tagInput.trim()) {
      const tag = tagInput.trim().replace(/^#/, '');
      if (!tags.includes(tag)) setTags((prev) => [...prev, tag]);
      setTagInput('');
    }
  };

  const handleRemoveTag = (tag: string) => {
    setTags((prev) => prev.filter((t) => t !== tag));
  };

  return (
    <div className="editor-page">
      {/* Paper texture header */}
      <div className="editor-header">
        <div className="editor-meta">
          <span className="editor-date">{formatDate(new Date(entryDate), { weekday: 'long', month: 'long', day: 'numeric' })}</span>
          <div className="editor-actions">
            <span className={`save-indicator ${saved ? 'saved' : 'unsaved'} ${saveAnim ? 'anim' : ''}`}>
              {saved ? '✓ Saved' : '● Unsaved'}
            </span>
            <button className="btn-save" onClick={save} title="Save entry">
              <Check size={14} /> Save
            </button>
            <button className="btn-back" onClick={() => navigate(-1)} title="Go back">
              <ArrowLeft size={14} /> Back
            </button>
          </div>
        </div>

        {/* Mood picker */}
        <div className="mood-picker">
          {MOODS.map((m) => (
            <button
              key={m.emoji}
              className={`mood-opt ${mood === m.emoji ? 'selected' : ''}`}
              onClick={() => setMood(mood === m.emoji ? '' : m.emoji)}
              title={m.label}
              style={{ '--mood-color': m.color } as React.CSSProperties}
            >
              <MoodIcon mood={m.emoji} size={20} />
            </button>
          ))}
        </div>
      </div>

      {/* Paper surface */}
      <div className="paper-surface">
        {/* Decorative lines */}
        <div className="paper-lines" aria-hidden="true">
          {Array.from({ length: 20 }).map((_, i) => (
            <div key={i} className="paper-line" />
          ))}
        </div>

        {/* Title */}
        <input
          className="editor-title-input"
          placeholder="Title (optional)..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          maxLength={120}
        />

        {/* Body */}
        <textarea
          className="editor-textarea"
          placeholder="Pour your thoughts here...&#10;&#10;What happened today? What are you grateful for? What's on your mind?"
          value={content}
          onChange={(e) => setContent(e.target.value)}
          onBlur={save}
          autoFocus={isNew}
        />

        {/* Tags */}
        <div className="tag-section">
          <div className="tags-list">
            {tags.map((tag) => (
              <span key={tag} className="tag">
                #{tag}
                <button className="tag-remove" onClick={() => handleRemoveTag(tag)} aria-label="Remove tag">
                  <X size={12} />
                </button>
              </span>
            ))}
            <input
              className="tag-input"
              placeholder="+ add tag, press Enter"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={handleAddTag}
            />
          </div>
        </div>
      </div>

      {/* Word count */}
      <div className="editor-footer">
        <span className="word-count">
          {content.trim() ? content.trim().split(/\s+/).length : 0} words
        </span>
      </div>
    </div>
  );
}
