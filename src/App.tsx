import { useMemo, useState } from 'react';
import { v4 as uuidv4 } from 'uuid';
import type { Task, Priority, SubTask } from './types';
import { useLocalStorage } from './useLocalStorage';
import { CheckSquare, Square, Trash2, Plus, Calendar, Tag } from 'lucide-react';
import './index.css';

function App() {
  const [tasks, setTasks] = useLocalStorage<Task[]>('brutalist-tasks', []);
  
  // Form State
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [dueDate, setDueDate] = useState('');
  const [tagsInput, setTagsInput] = useState('');
  
  // Filter/Sort State
  const [search, setSearch] = useState('');
  const [filterPriority, setFilterPriority] = useState<Priority | 'All'>('All');
  const [sortBy, setSortBy] = useState<'createdAt' | 'dueDate' | 'priority'>('createdAt');

  const handleAddTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    const newTags = tagsInput.split(',').map(t => t.trim()).filter(t => t);

    const newTask: Task = {
      id: uuidv4(),
      title,
      description,
      completed: false,
      priority,
      tags: newTags,
      dueDate: dueDate || null,
      subTasks: [],
      createdAt: Date.now(),
    };

    setTasks([newTask, ...tasks]);
    setTitle('');
    setDescription('');
    setPriority('Medium');
    setDueDate('');
    setTagsInput('');
  };

  const toggleTaskCompletion = (id: string) => {
    setTasks(tasks.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
  };

  const deleteTask = (id: string) => {
    setTasks(tasks.filter(t => t.id !== id));
  };

  const priorityOrder: Record<Priority, number> = {
    'Urgent': 4,
    'High': 3,
    'Medium': 2,
    'Low': 1,
  };

  const filteredAndSortedTasks = useMemo(() => {
    let result = tasks;

    // Search filter
    if (search) {
      const lowerSearch = search.toLowerCase();
      result = result.filter(t => 
        t.title.toLowerCase().includes(lowerSearch) || 
        t.description.toLowerCase().includes(lowerSearch) ||
        t.tags.some(tag => tag.toLowerCase().includes(lowerSearch))
      );
    }

    // Priority filter
    if (filterPriority !== 'All') {
      result = result.filter(t => t.priority === filterPriority);
    }

    // Sort
    result.sort((a, b) => {
      if (sortBy === 'createdAt') {
        return b.createdAt - a.createdAt;
      } else if (sortBy === 'dueDate') {
        if (!a.dueDate) return 1;
        if (!b.dueDate) return -1;
        return new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime();
      } else if (sortBy === 'priority') {
        return priorityOrder[b.priority] - priorityOrder[a.priority];
      }
      return 0;
    });

    return result;
  }, [tasks, search, filterPriority, sortBy]);


  return (
    <div className="app-container">
      <header className="header">
        <h1 className="text-3xl">Get Stuff Done.</h1>
        <p style={{ fontWeight: 'bold' }}>Brutalist Task Manager</p>
      </header>

      <section className="brutalist-card">
        <h2 className="text-2xl mb-4">New Task</h2>
        <form onSubmit={handleAddTask} className="flex-col gap-4">
          <input 
            type="text" 
            placeholder="TASK TITLE" 
            className="brutalist-input"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            required
          />
          <textarea 
            placeholder="Task Description (optional)" 
            className="brutalist-input"
            style={{ resize: 'vertical', minHeight: '80px' }}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
          <div className="flex gap-4" style={{ flexWrap: 'wrap' }}>
            <div className="flex-col gap-2" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Priority</label>
              <select 
                className="brutalist-input" 
                value={priority} 
                onChange={(e) => setPriority(e.target.value as Priority)}
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>
            <div className="flex-col gap-2" style={{ flex: 1, minWidth: '200px' }}>
              <label style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Due Date</label>
              <input 
                type="date" 
                className="brutalist-input"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
              />
            </div>
          </div>
          <div className="flex-col gap-2">
            <label style={{ fontWeight: 'bold', textTransform: 'uppercase' }}>Tags (comma separated)</label>
            <input 
              type="text" 
              placeholder="e.g. work, urgent, personal"
              className="brutalist-input"
              value={tagsInput}
              onChange={(e) => setTagsInput(e.target.value)}
            />
          </div>
          <button type="submit" className="brutalist-button mt-4 flex items-center justify-center gap-2" style={{ background: 'var(--tertiary)' }}>
            <Plus size={24} /> Add Task
          </button>
        </form>
      </section>

      <section className="filter-bar">
        <input 
          type="text" 
          placeholder="Search Tasks..." 
          className="brutalist-input"
          style={{ flex: 2, minWidth: '250px' }}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <select 
          className="filter-select"
          style={{ flex: 1, minWidth: '150px' }}
          value={filterPriority}
          onChange={(e) => setFilterPriority(e.target.value as Priority | 'All')}
        >
          <option value="All">All Priorities</option>
          <option value="Low">Low</option>
          <option value="Medium">Medium</option>
          <option value="High">High</option>
          <option value="Urgent">Urgent</option>
        </select>
        <select 
          className="filter-select"
          style={{ flex: 1, minWidth: '150px' }}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as 'createdAt' | 'dueDate' | 'priority')}
        >
          <option value="createdAt">Newest First</option>
          <option value="priority">Highest Priority</option>
          <option value="dueDate">Due Date</option>
        </select>
      </section>

      <section className="task-list flex-col gap-4">
        {filteredAndSortedTasks.length === 0 ? (
          <div className="brutalist-card" style={{ textAlign: 'center', background: 'var(--primary)' }}>
            <h2 className="text-2xl">NO TASKS FOUND</h2>
          </div>
        ) : (
          filteredAndSortedTasks.map(task => (
            <div key={task.id} className={`task-item ${task.completed ? 'completed' : ''}`}>
              <div className="flex gap-4 w-full">
                <button 
                  onClick={() => toggleTaskCompletion(task.id)}
                  style={{ background: 'transparent', border: 'none', cursor: 'pointer', paddingTop: '4px' }}
                >
                  {task.completed ? <CheckSquare size={32} /> : <Square size={32} />}
                </button>
                <div className="flex-col gap-2 w-full">
                  <div className="flex justify-between items-center" style={{ flexWrap: 'wrap', gap: '1rem' }}>
                    <h3 className="text-2xl task-title" style={{ margin: 0 }}>{task.title}</h3>
                    <div className="flex gap-2 items-center">
                      <span className={`priority-badge priority-${task.priority}`}>{task.priority}</span>
                      <button 
                        onClick={() => deleteTask(task.id)}
                        className="brutalist-button"
                        style={{ padding: '0.25rem 0.5rem', background: '#ff4444', color: 'white' }}
                        title="Delete Task"
                      >
                        <Trash2 size={20} />
                      </button>
                    </div>
                  </div>
                  
                  {task.description && (
                    <p style={{ fontWeight: '500', fontSize: '1.1rem' }}>{task.description}</p>
                  )}

                  <div className="flex gap-4 mt-4" style={{ flexWrap: 'wrap' }}>
                    {task.dueDate && (
                      <div className="flex items-center gap-2" style={{ fontWeight: 'bold' }}>
                        <Calendar size={18} /> 
                        <span>{new Date(task.dueDate).toLocaleDateString()}</span>
                      </div>
                    )}
                    {task.tags.length > 0 && (
                      <div className="flex items-center gap-2 flex-wrap">
                        <Tag size={18} />
                        {task.tags.map((tag, idx) => (
                          <span key={idx} className="tag">{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default App;
