import React, { useState, useEffect, useRef } from 'react';
import { 
  Clock, Play, Pause, SkipForward, Volume2, VolumeX, 
  Settings, Coffee, Brain, Umbrella, Upload, Crown,
  Moon, Sun, CloudRain, Wind, ChevronDown, Star, Users, Heart, Award,
  CheckSquare, Trash2, Plus, ListTodo, CheckCircle, Bird, Target, Zap, Shield, BarChart,
  LogIn, UserPlus, Bell
} from 'lucide-react';
import { v4 as uuidv4 } from 'uuid';
import confetti from 'canvas-confetti';
import './App.css';
import { AuthModal } from './components/AuthModal';

// Task interface
interface Task {
  id: string;
  text: string;
  completed: boolean;
}

function App() {
  // All state declarations
  const [activeSounds, setActiveSounds] = useState<Set<string>>(new Set());
  const [timeLeft, setTimeLeft] = useState(25 * 60);
  const [isActive, setIsActive] = useState(false);
  const [timerType, setTimerType] = useState('focus');
  const [customSettings, setCustomSettings] = useState({
    focus: 25,
    shortBreak: 5,
    longBreak: 30,
  });
  const [showSettings, setShowSettings] = useState(false);
  const [showSoundboard, setShowSoundboard] = useState(false);
  const [showTasks, setShowTasks] = useState(false);
  const [currentTheme, setCurrentTheme] = useState('default');
  const [isMuted, setIsMuted] = useState(false);
  const [completedSessions, setCompletedSessions] = useState(0);
  const [showPremiumModal, setShowPremiumModal] = useState(false);
  const [darkMode, setDarkMode] = useState(false);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTaskText, setNewTaskText] = useState('');
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<number | null>(null);
  const aboutSectionRef = useRef<HTMLDivElement>(null);
  const testimonialsSectionRef = useRef<HTMLDivElement>(null);
  const featuresSectionRef = useRef<HTMLDivElement>(null);

  // Check notification permission on mount
  useEffect(() => {
    if ('Notification' in window) {
      if (Notification.permission === 'granted') {
        setNotificationsEnabled(true);
      }
    }
  }, []);

  // Request notification permission
  const requestNotificationPermission = async () => {
    if (!('Notification' in window)) {
      console.log('This browser does not support notifications');
      return;
    }

    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setNotificationsEnabled(true);
      }
    } catch (error) {
      console.error('Error requesting notification permission:', error);
    }
  };

  // Send notification
  const sendNotification = (title: string, body: string) => {
    if (!notificationsEnabled) return;

    try {
      new Notification(title, {
        body,
        icon: '/vite.svg', // You can replace this with your app's icon
        badge: '/vite.svg',
        vibrate: [200, 100, 200],
      });
    } catch (error) {
      console.error('Error sending notification:', error);
    }
  };

  // Get notification message based on timer type
  const getNotificationMessage = () => {
    switch (timerType) {
      case 'focus':
        return {
          title: 'Focus Session Complete! 🎯',
          body: 'Great work! Time for a well-deserved break.',
        };
      case 'shortBreak':
        return {
          title: 'Break Time Over ⏰',
          body: 'Ready to get back to work? Your next focus session awaits!',
        };
      case 'longBreak':
        return {
          title: 'Long Break Complete 🌟',
          body: 'Feeling refreshed? Let\'s tackle the next set of tasks!',
        };
      default:
        return {
          title: 'Timer Complete',
          body: 'Time to move to the next session!',
        };
    }
  };

  // Available themes
  const themes = [
    { 
      id: 'default', 
      name: 'Ocean Calm', 
      color: '#58c4c4', 
      image: 'https://images.unsplash.com/photo-1507525428034-b723cf961d3e?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      gradient: 'linear-gradient(rgba(0, 0, 0, 0.4), rgba(0, 0, 0, 0.4))'
    },
    { 
      id: 'forest', 
      name: 'Forest Serenity', 
      color: '#8bc34a', 
      image: 'https://images.unsplash.com/photo-1448375240586-882707db888b?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      gradient: 'linear-gradient(rgba(0, 0, 0, 0.5), rgba(0, 0, 0, 0.5))'
    },
    { 
      id: 'night', 
      name: 'Night Sky', 
      color: '#45b3fa', 
      image: 'https://images.unsplash.com/photo-1519681393784-d120267933ba?ixlib=rb-1.2.1&auto=format&fit=crop&w=1920&q=80',
      gradient: 'linear-gradient(rgba(0, 0, 0, 0.6), rgba(0, 0, 0, 0.6))'
    },
    { 
      id: 'minimal', 
      name: 'Minimal', 
      color: '#58c4c4', 
      gradient: 'linear-gradient(to right bottom, #f0f2f5, #e5e9ec)'
    },
    { 
      id: 'premium', 
      name: 'Custom (Premium)', 
      color: '#ffd700', 
      isPremium: true 
    },
  ];

  // Available sounds
  const sounds = [
    { 
      id: 'rain', 
      name: 'Rainfall', 
      icon: <CloudRain size={32} />, 
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-light-rain-loop-2393.mp3' 
    },
    { 
      id: 'forest', 
      name: 'Forest Ambience', 
      icon: <Umbrella size={32} />, 
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-forest-stream-ambience-loop-542.mp3' 
    },
    { 
      id: 'birds', 
      name: 'Bird Songs', 
      icon: <Bird size={32} />, 
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-morning-birds-2472.mp3' 
    },
    { 
      id: 'whitenoise', 
      name: 'White Noise', 
      icon: <Wind size={32} />, 
      src: 'https://assets.mixkit.co/sfx/preview/mixkit-campfire-crackles-1330.mp3' 
    },
    { 
      id: 'custom', 
      name: 'Custom Sound (Premium)', 
      icon: <Upload size={32} />, 
      isPremium: true 
    },
  ];

  // Toggle sound playback
  const toggleSound = (sound: typeof sounds[0]) => {
    if (sound.isPremium) {
      setShowPremiumModal(true);
      return;
    }

    if (activeSounds.has(sound.id)) {
      const newActiveSounds = new Set(activeSounds);
      newActiveSounds.delete(sound.id);
      setActiveSounds(newActiveSounds);
    } else {
      setActiveSounds(new Set(activeSounds).add(sound.id));
    }
  };

  // Change theme
  const changeTheme = (themeId: string) => {
    const theme = themes.find(t => t.id === themeId);
    
    if (theme?.isPremium) {
      setShowPremiumModal(true);
      return;
    }
    
    setCurrentTheme(themeId);
    
    // Apply theme styles
    document.documentElement.style.setProperty('--primary-color', theme?.color || '#58c4c4');
    
    // Apply background styles
    if (theme?.image) {
      document.body.style.backgroundImage = `${theme.gradient}, url(${theme.image})`;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundPosition = 'center';
      document.body.style.backgroundAttachment = 'fixed';
    } else if (theme?.gradient) {
      document.body.style.backgroundImage = theme.gradient;
      document.body.style.backgroundSize = 'cover';
      document.body.style.backgroundAttachment = 'fixed';
    } else {
      document.body.style.backgroundImage = 'none';
      document.body.style.backgroundColor = darkMode ? '#121212' : '#f5f5f5';
    }
  };

  // Toggle dark mode
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
    if (!darkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
    // Reapply current theme to ensure proper dark mode integration
    changeTheme(currentTheme);
  };

  // Format time to MM:SS
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // Timer logic
  useEffect(() => {
    if (isActive) {
      timerRef.current = window.setInterval(() => {
        setTimeLeft((prevTime) => {
          if (prevTime <= 1) {
            clearInterval(timerRef.current!);
            setIsActive(false);
            playAlarmSound();
            
            // Send notification
            const message = getNotificationMessage();
            sendNotification(message.title, message.body);
            
            // Handle session completion
            if (timerType === 'focus') {
              setCompletedSessions(prev => prev + 1);
              triggerConfetti();
            }
            
            // Auto switch to next timer type
            if (timerType === 'focus') {
              // After every 4 focus sessions, take a long break
              if ((completedSessions + 1) % 4 === 0) {
                handleTimerTypeChange('longBreak');
              } else {
                handleTimerTypeChange('shortBreak');
              }
            } else {
              handleTimerTypeChange('focus');
            }
            
            return 0;
          }
          return prevTime - 1;
        });
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [isActive, timerType, completedSessions]);

  // Apply default theme on first load
  useEffect(() => {
    changeTheme('default');
    
    // Load tasks from localStorage if available
    const savedTasks = localStorage.getItem('deepFocusTasks');
    if (savedTasks) {
      setTasks(JSON.parse(savedTasks));
    }
    
    // Check for dark mode preference
    const prefersDarkMode = window.matchMedia('(prefers-color-scheme: dark)').matches;
    if (prefersDarkMode) {
      setDarkMode(true);
      document.body.classList.add('dark-mode');
    }
  }, []);

  // Save tasks to localStorage when they change
  useEffect(() => {
    localStorage.setItem('deepFocusTasks', JSON.stringify(tasks));
  }, [tasks]);

  // Play alarm sound when timer ends
  const playAlarmSound = () => {
    if (!isMuted) {
      const audio = new Audio('https://assets.mixkit.co/sfx/preview/mixkit-alarm-digital-clock-beep-989.mp3');
      audio.play();
    }
  };

  // Toggle timer start/pause
  const toggleTimer = () => {
    if (!isActive && !notificationsEnabled) {
      requestNotificationPermission();
    }
    setIsActive(!isActive);
  };

  // Reset timer
  const resetTimer = () => {
    setIsActive(false);
    setTimeLeft(customSettings[timerType as keyof typeof customSettings] * 60);
  };

  // Change timer type (focus, short break, long break)
  const handleTimerTypeChange = (type: string) => {
    setTimerType(type);
    setIsActive(false);
    setTimeLeft(customSettings[type as keyof typeof customSettings] * 60);
  };

  // Update custom timer settings
  const updateCustomSettings = (type: string, value: number) => {
    setCustomSettings({
      ...customSettings,
      [type]: value,
    });
    
    // Update current timer if it's the one being modified
    if (type === timerType) {
      setTimeLeft(value * 60);
    }
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    if (audioRef.current) {
      if (isMuted) {
        audioRef.current.play();
      } else {
        audioRef.current.pause();
      }
    }
  };

  // Calculate progress percentage
  const calculateProgress = () => {
    const totalSeconds = customSettings[timerType as keyof typeof customSettings] * 60;
    return ((totalSeconds - timeLeft) / totalSeconds) * 100;
  };

  // Trigger confetti animation
  const triggerConfetti = () => {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
      colors: ['#58c4c4', '#45b3fa', '#8bc34a'],
      disableForReducedMotion: true
    });
  };

  // Task functions
  const addTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (newTaskText.trim() === '') return;
    
    const newTask: Task = {
      id: uuidv4(),
      text: newTaskText,
      completed: false
    };
    
    setTasks([...tasks, newTask]);
    setNewTaskText('');
  };
  
  const toggleTaskCompletion = (id: string) => {
    const taskToToggle = tasks.find(task => task.id === id);
    const wasCompleted = taskToToggle?.completed;
    
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed } : task
    ));
    
    // Only trigger confetti when marking as completed
    if (!wasCompleted) {
      triggerConfetti();
    }
  };
  
  const deleteTask = (id: string) => {
    setTasks(tasks.filter(task => task.id !== id));
  };

  return (
    <div className="app-container">
      {/* Audio element for ambient sounds */}
      <audio ref={audioRef} />
      
      {/* Header */}
      <header className="header">
        <div className="logo">
          <Clock size={28} />
          <h1>Deep Focus</h1>
        </div>
        
        <div className="header-controls">
          {/* Desktop view */}
          <div className="hidden md:flex items-center gap-4">
            <button 
              className="control-button secondary flex items-center gap-2"
              onClick={() => setShowSoundboard(!showSoundboard)}
            >
              {isMuted ? <VolumeX size={20} /> : <Volume2 size={20} />}
              <span>Sounds</span>
            </button>
            
            <button 
              className="control-button secondary flex items-center gap-2"
              onClick={() => setShowSettings(!showSettings)}
            >
              <Settings size={20} />
              <span>Settings</span>
            </button>
            
            <button 
              className="control-button secondary flex items-center gap-2"
              onClick={() => setShowTasks(!showTasks)}
            >
              <CheckSquare size={20} />
              <span>Tasks</span>
            </button>

            <div className="flex items-center gap-3 ml-2">
              <button 
                className="control-button secondary flex items-center gap-2"
                onClick={() => setShowAuthModal(true)}
              >
                <LogIn size={20} />
                <span>Login</span>
              </button>
              
              <button 
                className="control-button flex items-center gap-2 bg-secondary-color"
                onClick={() => setShowAuthModal(true)}
              >
                <UserPlus size={20} />
                <span>Sign Up</span>
              </button>
            </div>
          </div>

          {/* Mobile view */}
          <div className="flex md:hidden items-center gap-2">
            <button 
              className="icon-button" 
              onClick={() => setShowSoundboard(!showSoundboard)}
              title="Sounds"
            >
              {isMuted ? <VolumeX size={24} /> : <Volume2 size={24} />}
            </button>
            
            <button 
              className="icon-button" 
              onClick={() => setShowSettings(!showSettings)}
              title="Settings"
            >
              <Settings size={24} />
            </button>
            
            <button 
              className="icon-button" 
              onClick={() => setShowTasks(!showTasks)}
              title="Tasks"
            >
              <CheckSquare size={24} />
            </button>

            <button 
              className="icon-button" 
              onClick={() => setShowAuthModal(true)}
              title="Login"
            >
              <LogIn size={24} />
            </button>
          </div>
          
          <button className="premium-button" onClick={() => setShowPremiumModal(true)}>
            <Crown size={18} />
            <span>Premium</span>
          </button>
        </div>
      </header>

      {/* Main Timer Display */}
      <main className="timer-container">
        <h2 className="timer-label">
          {timerType === 'focus' ? 'Focus Time' : timerType === 'shortBreak' ? 'Short Break' : 'Long Break'}
        </h2>
        
        <div className="timer-display">
          <div className="timer-progress" style={{ background: `conic-gradient(var(--primary-color) ${calculateProgress()}%, transparent 0)` }}>
            <div className="timer-progress-inner">
              <span className="time">{formatTime(timeLeft)}</span>
            </div>
          </div>
        </div>
        
        {/* Timer Type Selector */}
        <div className="timer-types">
          <button 
            className={`timer-type-button ${timerType === 'focus' ? 'active' : ''}`}
            onClick={() => handleTimerTypeChange('focus')}
          >
            <Brain size={20} />
            <span>Focus</span>
            <span className="time-value">{customSettings.focus} min</span>
          </button>
          
          <button 
            className={`timer-type-button ${timerType === 'shortBreak' ? 'active' : ''}`}
            onClick={() => handleTimerTypeChange('shortBreak')}
          >
            <Coffee size={20} />
            <span>Short Break</span>
            <span className="time-value">{customSettings.shortBreak} min</span>
          </button>
          
          <button 
            className={`timer-type-button ${timerType === 'longBreak' ? 'active' : ''}`}
            onClick={() => handleTimerTypeChange('longBreak')}
          >
            <Umbrella size={20} />
            <span>Long Break</span>
            <span className="time-value">{customSettings.longBreak} min</span>
          </button>
        </div>
        
        {/* Timer Controls */}
        <div className="timer-controls">
          <button 
            className="control-button"
            onClick={toggleTimer}
          >
            {isActive ? <Pause size={24} /> : <Play size={24} />}
            <span>{isActive ? 'Pause' : 'Start'}</span>
          </button>
          
          <button 
            className="control-button secondary"
            onClick={resetTimer}
          >
            <SkipForward size={24} />
            <span>Reset</span>
          </button>

          {!notificationsEnabled && (
            <button 
              className="control-button secondary"
              onClick={requestNotificationPermission}
            >
              <Bell size={24} />
              <span>Enable Notifications</span>
            </button>
          )}
        </div>
        
        {/* Session Counter */}
        <div className="session-counter">
          <p>Completed Sessions: {completedSessions}</p>
        </div>
      </main>
      
      {/* Settings Panel */}
      {showSettings && (
        <div className="settings-panel">
          <div className="settings-header">
            <h3>Settings</h3>
            <button className="close-button" onClick={() => setShowSettings(false)}>×</button>
          </div>
          
          <div className="settings-content">
            <div className="settings-section">
              <h4>Timer Duration (minutes)</h4>
              
              <div className="setting-item">
                <label htmlFor="focusTime">Focus Time:</label>
                <input 
                  type="number" 
                  id="focusTime" 
                  min="1" 
                  max="120" 
                  value={customSettings.focus}
                  onChange={(e) => updateCustomSettings('focus', parseInt(e.target.value))}
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="shortBreakTime">Short Break:</label>
                <input 
                  type="number" 
                  id="shortBreakTime" 
                  min="1" 
                  max="30" 
                  value={customSettings.shortBreak}
                  onChange={(e) => updateCustomSettings('shortBreak', parseInt(e.target.value))}
                />
              </div>
              
              <div className="setting-item">
                <label htmlFor="longBreakTime">Long Break:</label>
                <input 
                  type="number" 
                  id="longBreakTime" 
                  min="1" 
                  max="60" 
                  value={customSettings.longBreak}
                  onChange={(e) => updateCustomSettings('longBreak', parseInt(e.target.value))}
                />
              </div>
            </div>
            
            <div className="settings-section">
              <h4>Appearance</h4>
              
              <div className="setting-item">
                <label htmlFor="darkModeToggle">Dark Mode:</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="darkModeToggle" 
                    checked={darkMode}
                    onChange={toggleDarkMode}
                  />
                  <label htmlFor="darkModeToggle"></label>
                </div>
              </div>
              
              <h4>Themes</h4>
              <div className="themes-grid">
                {themes.map((theme) => (
                  <div 
                    key={theme.id}
                    className={`theme-item ${currentTheme === theme.id ? 'active' : ''} ${theme.isPremium ? 'premium' : ''}`}
                    onClick={() => changeTheme(theme.id)}
                    style={{ 
                      backgroundColor: theme.color,
                      backgroundImage: theme.image ? `${theme.gradient}, url(${theme.image})` : theme.gradient || 'none',
                      backgroundSize: 'cover',
                      backgroundPosition: 'center'
                    }}
                  >
                    {theme.isPremium && <Crown size={16} className="premium-icon" />}
                    <span>{theme.name}</span>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="settings-section">
              <h4>Audio</h4>
              <div className="setting-item">
                <label htmlFor="muteToggle">Mute All Sounds:</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="muteToggle" 
                    checked={isMuted}
                    onChange={toggleMute}
                  />
                  <label htmlFor="muteToggle"></label>
                </div>
              </div>
            </div>

            <div className="settings-section">
              <h4>Notifications</h4>
              <div className="setting-item">
                <label htmlFor="notificationsToggle">Enable Notifications:</label>
                <div className="toggle-switch">
                  <input 
                    type="checkbox" 
                    id="notificationsToggle" 
                    checked={notificationsEnabled}
                    onChange={requestNotificationPermission}
                    disabled={!('Notification' in window)}
                  />
                  <label htmlFor="notificationsToggle"></label>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Soundboard Panel */}
      {showSoundboard && (
        <div className="soundboard-panel">
          <div className="settings-header">
            <h3 className="text-xl font-semibold">Soundboard</h3>
            <button className="close-button" onClick={() => setShowSoundboard(false)}>×</button>
          </div>
          
          <div className="sounds-grid">
            {sounds.map((sound) => (
              <div 
                key={sound.id}
                className={`sound-item ${sound.isPremium ? 'premium' : ''} ${activeSounds.has(sound.id) ? 'active' : ''}`}
                onClick={() => toggleSound(sound)}
              >
                {sound.icon}
                <span className="text-lg font-medium">{sound.name}</span>
                {!sound.isPremium && (
                  activeSounds.has(sound.id) ? 
                    <Pause size={24} className="play-pause-icon" /> : 
                    <Play size={24} className="play-pause-icon" />
                )}
                {sound.isPremium && <Crown size={20} className="premium-icon" />}
              </div>
            ))}
          </div>
          
          <div className="volume-control">
            <button 
              className="icon-button" 
              onClick={toggleMute}
            >
              {isMuted ? <VolumeX size={28} /> : <Volume2 size={28} />}
            </button>
            <input 
              type="range" 
              min="0" 
              max="100" 
              defaultValue="50"
              disabled={isMuted}
              onChange={(e) => {
                if (audioRef.current) {
                  audioRef.current.volume = parseInt(e.target.value) / 100;
                }
              }}
            />
          </div>
        </div>
      )}
      
      {/* Tasks Panel */}
      {showTasks && (
        <div className="tasks-panel">
          <div className="settings-header">
            <h3>Tasks</h3>
            <button className="close-button" onClick={() => setShowTasks(false)}>×</button>
          </div>
          
          <div className="tasks-content">
            <form className="task-form" onSubmit={addTask}>
              <input 
                type="text" 
                placeholder="Add a new task..." 
                value={newTaskText}
                onChange={(e) => setNewTaskText(e.target.value)}
              />
              <button type="submit">
                <Plus size={18} />
              </button>
            </form>
            
            {tasks.length > 0 ? (
              <ul className="tasks-list">
                {tasks.map(task => (
                  <li key={task.id} className={`task-item ${task.completed ? 'task-completed' : ''}`}>
                    <input 
                      type="checkbox" 
                      className="task-checkbox" 
                      checked={task.completed}
                      onChange={() => toggleTaskCompletion(task.id)}
                    />
                    <span className="task-text">{task.text}</span>
                    <button 
                      className="task-delete"
                      onClick={() => deleteTask(task.id)}
                    >
                      <Trash2 size={18} />
                    </button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="no-tasks">No tasks yet. Add one to get started!</p>
            )}
          </div>
        </div>
      )}
      
      {/* Premium Modal */}
      {showPremiumModal && (
        <div className="modal-overlay">
          <div className="premium-modal">
            <div className="premium-header">
              <Crown size={28} />
              <h3>Upgrade to Premium</h3>
              <button className="close-button" onClick={() => setShowPremiumModal(false)}>×</button>
            </div>
            
            <div className="premium-content">
              <p>Unlock all premium features and enhance your productivity experience:</p>
              
              <ul className="premium-features">
                <li>
                  <Upload size={18} />
                  <span>Upload custom background images</span>
                </li>
                <li>
                  <Volume2 size={18} />
                  <span>Upload custom ambient sounds</span>
                </li>
                <li>
                  <Clock size={18} />
                  <span>Advanced timer statistics and insights</span>
                </li>
                <li>
                  <Sun size={18} />
                  <span>Additional premium themes</span>
                </li>
                <li>
                  <CheckSquare size={18} />
                  <span>Advanced task management with categories</span>
                </li>
              
              </ul>
              
              <div className="premium-plans">
                <div className="premium-plan">
                  <h4>Monthly</h4>
                  <p className="price">$4.99<span>/month</span></p>
                  <button className="premium-action-button">Subscribe</button>
                </div>
                
                <div className="premium-plan recommended">
                  <div className="recommended-badge">Best Value</div>
                  <h4>Yearly</h4>
                  <p className="price">$39.99<span>/year</span></p>
                  <p className="savings">Save 33%</p>
                  <button className="premium-action-button">Subscribe</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Auth Modal */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
        />
      )}

      {/* About Section */}
      <section className="about-section py-20 px-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              Why Deep Focus?
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Discover a new way to manage your time and boost productivity with our scientifically-backed approach to deep work and focused sessions.
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Target className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Enhanced Focus
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Our timer is designed to help you maintain peak concentration during work sessions.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Zap className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Increased Productivity
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Break your work into manageable sessions to accomplish more without burnout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="p-3 bg-primary-100 rounded-lg">
                  <Shield className="w-6 h-6 text-primary-600" />
                </div>
                <div>
                  <h3 className="text-xl font-semibold mb-2 text-gray-900 dark:text-white">
                    Better Work-Life Balance
                  </h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Structured breaks ensure you stay refreshed and maintain a healthy balance.
                  </p>
                </div>
              </div>
            </div>

            <div className="relative">
              <img 
                src="https://images.unsplash.com/photo-1499750310107-5fef28a66643?ixlib=rb-1.2.1&auto=format&fit=crop&w=800&q=80"
                alt="Productive workspace"
                className="rounded-lg shadow-xl"
              />
              <div className="absolute -bottom-6 -right-6 bg-white dark:bg-gray-800 p-6 rounded-lg shadow-lg">
                <div className="flex items-center gap-3">
                  <BarChart className="w-8 h-8 text-primary-600" />
                  <div>
                    <div className="text-2xl font-bold text-gray-900 dark:text-white">500K+</div>
                    <div className="text-sm text-gray-600 dark:text-gray-300">Active Users</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section py-20 px-6">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-white">
              Powerful Features
            </h2>
            <p className="text-lg text-gray-200 max-w-2xl mx-auto">
              Everything you need to maximize your productivity and maintain focus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Clock className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Smart Timer</h3>
              <p className="text-gray-300">
                Customizable timer intervals with automatic break scheduling and session tracking.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <Volume2 className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Ambient Sounds</h3>
              <p className="text-gray-300">
                A collection of calming background sounds to help you stay focused and productive.
              </p>
            </div>

            <div className="bg-white/10 backdrop-blur-lg p-6 rounded-xl">
              <div className="w-12 h-12 bg-primary-600 rounded-lg flex items-center justify-center mb-4">
                <CheckSquare className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-xl font-semibold mb-3 text-white">Task Management</h3>
              <p className="text-gray-300">
                Integrated task list to keep track of your goals and achievements during focus sessions.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="testimonials-section py-20 px-6 bg-white/90 dark:bg-gray-900/90 backdrop-blur-lg">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold mb-4 text-gray-900 dark:text-white">
              What Our Users Say
            </h2>
            <p className="text-lg text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
              Join thousands of satisfied users who have transformed their productivity with Deep Focus.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-purple-600 flex items-center justify-center text-white font-semibold">
                  S
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Sarah M.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Med Student</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "Deep Focus has completely transformed how I study. The ambient sounds and customizable timers help me stay in the zone for hours."
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                  J
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">James R.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Software Engineer</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "The task management feature combined with focused sessions has helped me complete projects faster than ever before."
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg">
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-full bg-green-600 flex items-center justify-center text-white font-semibold">
                  E
                </div>
                <div>
                  <h4 className="font-semibold text-gray-900 dark:text-white">Emily L.</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400">Content Creator</p>
                </div>
              </div>
              <p className="text-gray-600 dark:text-gray-300">
                "I love how the app helps me maintain a healthy work-life balance. The break reminders are a game-changer!"
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="footer">
        <div className="footer-content">
          <div>
            <div className="footer-logo">
              <Clock size={24} />
              <h3>Deep Focus</h3>
            </div>
            <p>Enhance your productivity with our focused approach to time management.</p>
          </div>
          
          <div className="footer-links">
            <div className="footer-column">
              <h4>Product</h4>
              <ul>
                <li><a href="#features">Features</a></li>
                <li><a href="#pricing">Pricing</a></li>
                <li><a href="#testimonials">Testimonials</a></li>
                <li><a href="#faq">FAQ</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Company</h4>
              <ul>
                <li><a href="#about">About Us</a></li>
                <li><a href="#blog">Blog</a></li>
                <li><a href="#careers">Careers</a></li>
                <li><a href="#contact">Contact</a></li>
              </ul>
            </div>
            
            <div className="footer-column">
              <h4>Legal</h4>
              <ul>
                <li><a href="#privacy">Privacy Policy</a></li>
                <li><a href="#terms">Terms of Service</a></li>
                <li><a href="#cookies">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
        </div>
        
        <div className="footer-bottom">
          <p>© 2025 Deep Focus. All rights reserved.</p>
          <p>Made with <Heart size={16} /> for productivity</p>
        </div>
      </footer>
    </div>
  );
}

export default App;