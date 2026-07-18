import React from 'react'
import { useState } from 'react'
import { Pane } from '../Pane.jsx'
import { useLocalStorage } from '../../hooks/useLocalStorage.js'

export function TodoScratchPane() {
  const [todos, setTodos] = useLocalStorage('gs.todos', [])
  const [scratch, setScratch] = useLocalStorage('gs.scratch', '')
  const [draft, setDraft] = useState('')

  const add = (e) => {
    if (e.key !== 'Enter' || !draft.trim()) return
    setTodos((t) => [...t, { id: Date.now(), text: draft.trim(), done: false }])
    setDraft('')
  }
  const toggle = (id) => setTodos((t) => t.map((x) => (x.id === id ? { ...x, done: !x.done } : x)))

  return (
    <Pane title="todo & scratch" badge={todos.filter((t) => !t.done).length || null}>
      <input
        value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={add}
        placeholder="add todo…"
        className="mb-1 w-full bg-transparent text-[11px] text-gs-text placeholder:text-gs-dim/60 focus:outline-none"
      />
      {todos.map((t) => (
        <div key={t.id} onClick={() => toggle(t.id)}
             className={`cursor-pointer py-0.5 text-gs-text ${t.done ? 'text-gs-dim line-through' : ''}`}>
          <span className="text-gs-violet">{t.done ? '✓' : '▸'}</span> {t.text}
        </div>
      ))}
      <textarea
        value={scratch} onChange={(e) => setScratch(e.target.value)}
        placeholder="scratch…" rows={2}
        className="mt-2 w-full resize-none bg-transparent text-[10px] italic text-gs-dim placeholder:text-gs-dim/50 focus:outline-none"
      />
    </Pane>
  )
}
