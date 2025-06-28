import React, { useState, useEffect, useRef } from 'react';
import { Play, Pause, X, RotateCcw, Volume2, VolumeX, Settings } from 'lucide-react';
import { soundService } from '../services/SoundService';

export type BreathingType = '4-7-8' | 'box';

interface BreathingExerciseProps {
  type: BreathingType;
  isOpen: boolean;
  onClose: () => void;
  onComplete?: () => void;
}

interface BreathingPhase {
  name: string;
  duration: number;
  instruction: string;
}

export const BreathingExercise: React.FC<BreathingExerciseProps> = ({
  type,
  isOpen,
  onClose,
  onComplete
}) => {
  const [isActive, setIsActive] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [currentPhase, setCurrentPhase] = useState(0);
  const [timeRemaining, setTimeRemaining] = useState(0);
  const [cycleCount, setCycleCount] = useState(0);
  const [totalCycles, setTotalCycles] = useState(5);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [showSettings, setShowSettings] = useState(false);
  
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);

  // Define breathing patterns
  const breathingPatterns: Record<BreathingType, BreathingPhase[]> = {
    '4-7-8': [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly through your nose' },
      { name: 'Hold', duration: 7, instruction: 'Hold your breath gently' },
      { name: 'Exhale', duration: 8, instruction: 'Exhale completely through your mouth' }
    ],
    'box': [
      { name: 'Inhale', duration: 4, instruction: 'Breathe in slowly and deeply' },
      { name: 'Hold', duration: 4, instruction: 'Hold your breath comfortably' },
      { name: 'Exhale', duration: 4, instruction: 'Breathe out slowly and completely' },
      { name: 'Hold', duration: 4, instruction: 'Hold with empty lungs' }
    ]
  };

  const currentPattern = breathingPatterns[type];
  const currentPhaseData = currentPattern[currentPhase];

  // Initialize audio context
  useEffect(() => {
    if (soundEnabled && !audioContextRef.current) {
      try {
        audioContextRef.current = new (window.AudioContext || (window as any).webkitAudioContext)();
      } catch (error) {
        console.warn('Web Audio API not supported:', error);
      }
    }
  }, [soundEnabled]);

  // Main breathing timer
  useEffect(() => {
    if (isActive && !isPaused && timeRemaining > 0) {
      intervalRef.current = setInterval(() => {
        setTimeRemaining(prev => {
          if (prev <= 1) {
            // Move to next phase
            const nextPhase = (currentPhase + 1) % currentPattern.length;
            
            if (nextPhase === 0) {
              // Completed a full cycle
              const newCycleCount = cycleCount + 1;
              setCycleCount(newCycleCount);
              
              if (newCycleCount >= totalCycles) {
                // Exercise complete
                setIsActive(false);
                playCompletionSound();
                onComplete?.();
                return 0;
              }
            }
            
            setCurrentPhase(nextPhase);
            playPhaseTransitionSound();
            return currentPattern[nextPhase].duration;
          }
          return prev - 1;
        });
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isActive, isPaused, timeRemaining, currentPhase, cycleCount, totalCycles, currentPattern]);

  // Initialize first phase when starting
  useEffect(() => {
    if (isActive && timeRemaining === 0) {
      setTimeRemaining(currentPattern[0].duration);
      setCurrentPhase(0);
    }
  }, [isActive, currentPattern]);

  const playPhaseTransitionSound = () => {
    if (!soundEnabled || !audioContextRef.current) return;

    try {
      if (audioContextRef.current.state === 'suspended') {
        audioContextRef.current.resume();
      }

      const oscillator = audioContextRef.current.createOscillator();
      const gainNode = audioContextRef.current.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContextRef.current.destination);

      // Different tones for different phases
      const frequencies = {
        'Inhale': 440, // A4
        'Hold': 523, // C5
        'Exhale': 349 // F4
      };

      oscillator.frequency.setValueAtTime(
        frequencies[currentPhaseData.name as keyof typeof frequencies] || 440,
        audioContextRef.current.currentTime
      );
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0, audioContextRef.current.currentTime);
      gainNode.gain.linearRampToValueAtTime(0.1, audioContextRef.current.currentTime + 0.1);
      gainNode.gain.exponentialRampToValueAtTime(0.001, audioContextRef.current.currentTime + 0.5);

      oscillator.start(audioContextRef.current.currentTime);
      oscillator.stop(audioContextRef.current.currentTime + 0.5);
    } catch (error) {
      console.warn('Error playing phase transition sound:', error);
    }
  };

  const playCompletionSound = () => {
    if (!soundEnabled) return;
    
    try {
      soundService.playBreakCompleteSound();
    } catch (error) {
      console.warn('Error playing completion sound:', error);
    }
  };

  const startExercise = () => {
    // Initialize audio context on user interaction
    if (soundEnabled && audioContextRef.current?.state === 'suspended') {
      audioContextRef.current.resume();
    }
    
    setIsActive(true);
    setIsPaused(false);
    setCycleCount(0);
    setCurrentPhase(0);
    setTimeRemaining(currentPattern[0].duration);
  };

  const pauseExercise = () => {
    setIsPaused(true);
  };

  const resumeExercise = () => {
    setIsPaused(false);
  };

  const resetExercise = () => {
    setIsActive(false);
    setIsPaused(false);
    setCycleCount(0);
    setCurrentPhase(0);
    setTimeRemaining(0);
  };

  const handleClose = () => {
    resetExercise();
    onClose();
  };

  // Calculate progress for visual indicator
  const phaseProgress = currentPhaseData ? 
    ((currentPhaseData.duration - timeRemaining) / currentPhaseData.duration) * 100 : 0;
  
  const overallProgress = totalCycles > 0 ? 
    ((cycleCount * currentPattern.length + currentPhase) / (totalCycles * currentPattern.length)) * 100 : 0;

  // Visual breathing guide scale
  const getBreathingScale = () => {
    if (!isActive || isPaused) return 1;
    
    const progress = phaseProgress / 100;
    
    switch (currentPhaseData.name) {
      case 'Inhale':
        return 1 + (progress * 0.5); // Scale from 1 to 1.5
      case 'Exhale':
        return 1.5 - (progress * 0.5); // Scale from 1.5 to 1
      case 'Hold':
        return currentPhase === 1 ? 1.5 : 1; // Stay at current size during hold
      default:
        return 1;
    }
  };

  const getPhaseColor = () => {
    switch (currentPhaseData?.name) {
      case 'Inhale':
        return 'from-blue-400 to-blue-600';
      case 'Hold':
        return 'from-purple-400 to-purple-600';
      case 'Exhale':
        return 'from-green-400 to-green-600';
      default:
        return 'from-gray-400 to-gray-600';
    }
  };

  if (!isOpen) return null;

  return (
    <div className="modal-overlay-critical modal-open flex items-center justify-center p-4 backdrop-blur-sm">
      <div className="modal-content-fix bg-white dark:bg-calm-800 rounded-2xl shadow-2xl dark:shadow-gentle-dark max-w-lg w-full border border-calm-200 dark:border-calm-700">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-calm-200 dark:border-calm-700">
          <div>
            <h2 className="text-xl font-semibold text-gray-800 dark:text-gray-200">
              {type === '4-7-8' ? '4-7-8 Breathing' : 'Box Breathing'}
            </h2>
            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
              {type === '4-7-8' 
                ? 'Inhale 4, hold 7, exhale 8 for relaxation'
                : 'Equal counts for balanced breathing'
              }
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowSettings(!showSettings)}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors focus-ring"
              aria-label="Exercise settings"
            >
              <Settings className="w-5 h-5" />
            </button>
            <button
              onClick={handleClose}
              className="p-2 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 rounded-lg transition-colors focus-ring"
              aria-label="Close exercise"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Settings Panel */}
        {showSettings && (
          <div className="p-4 bg-gray-50 dark:bg-gray-800 border-b border-calm-200 dark:border-calm-700">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Number of cycles
                </label>
                <select
                  value={totalCycles}
                  onChange={(e) => setTotalCycles(parseInt(e.target.value))}
                  disabled={isActive}
                  className="form-select text-sm w-20 focus-ring"
                >
                  <option value={3}>3</option>
                  <option value={5}>5</option>
                  <option value={10}>10</option>
                  <option value={15}>15</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
                  Sound guidance
                </label>
                <button
                  onClick={() => setSoundEnabled(!soundEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus-ring ${
                    soundEnabled ? 'bg-blue-500' : 'bg-gray-200 dark:bg-gray-600'
                  }`}
                  aria-pressed={soundEnabled}
                >
                  <span
                    className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                      soundEnabled ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Main Exercise Area */}
        <div className="p-8 text-center">
          {/* Progress Indicator */}
          <div className="mb-6">
            <div className="flex items-center justify-between text-sm text-gray-600 dark:text-gray-400 mb-2">
              <span>Cycle {cycleCount + 1} of {totalCycles}</span>
              <span>{Math.round(overallProgress)}% Complete</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-500 dark:bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ width: `${overallProgress}%` }}
              />
            </div>
          </div>

          {/* Breathing Visual Guide */}
          <div className="mb-8 flex items-center justify-center">
            <div 
              className={`w-48 h-48 rounded-full bg-gradient-to-br ${getPhaseColor()} flex items-center justify-center transition-all duration-1000 ease-in-out shadow-lg`}
              style={{ 
                transform: `scale(${getBreathingScale()})`,
                filter: 'drop-shadow(0 8px 16px rgba(0,0,0,0.1))'
              }}
            >
              <div className="text-center text-white">
                {isActive && currentPhaseData && (
                  <>
                    <div className="text-2xl font-bold mb-2">{currentPhaseData.name}</div>
                    <div className="text-4xl font-bold">{timeRemaining}</div>
                    <div className="text-sm mt-2 opacity-90 max-w-32 leading-tight">
                      {currentPhaseData.instruction}
                    </div>
                  </>
                )}
                {!isActive && (
                  <div className="text-2xl font-bold">Ready</div>
                )}
              </div>
            </div>
          </div>

          {/* Phase Progress */}
          {isActive && currentPhaseData && (
            <div className="mb-6">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1">
                <div 
                  className="bg-white h-1 rounded-full transition-all duration-100"
                  style={{ width: `${phaseProgress}%` }}
                />
              </div>
            </div>
          )}

          {/* Controls */}
          <div className="flex items-center justify-center space-x-4">
            {!isActive ? (
              <button
                onClick={startExercise}
                className="flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 dark:bg-blue-600 dark:hover:bg-blue-700 text-white rounded-lg transition-colors font-medium focus-ring"
              >
                <Play className="w-5 h-5" />
                <span>Start Exercise</span>
              </button>
            ) : (
              <>
                {isPaused ? (
                  <button
                    onClick={resumeExercise}
                    className="flex items-center space-x-2 px-6 py-3 bg-green-500 hover:bg-green-600 dark:bg-green-600 dark:hover:bg-green-700 text-white rounded-lg transition-colors font-medium focus-ring"
                  >
                    <Play className="w-5 h-5" />
                    <span>Resume</span>
                  </button>
                ) : (
                  <button
                    onClick={pauseExercise}
                    className="flex items-center space-x-2 px-6 py-3 bg-yellow-500 hover:bg-yellow-600 dark:bg-yellow-600 dark:hover:bg-yellow-700 text-white rounded-lg transition-colors font-medium focus-ring"
                  >
                    <Pause className="w-5 h-5" />
                    <span>Pause</span>
                  </button>
                )}
                
                <button
                  onClick={resetExercise}
                  className="flex items-center space-x-2 px-4 py-3 bg-gray-500 hover:bg-gray-600 dark:bg-gray-600 dark:hover:bg-gray-700 text-white rounded-lg transition-colors font-medium focus-ring"
                >
                  <RotateCcw className="w-5 h-5" />
                  <span>Reset</span>
                </button>
              </>
            )}
          </div>

          {/* Sound Status */}
          {soundEnabled && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-600 dark:text-gray-400">
              <Volume2 className="w-4 h-4" />
              <span>Sound guidance enabled</span>
            </div>
          )}
          
          {!soundEnabled && (
            <div className="mt-4 flex items-center justify-center space-x-2 text-sm text-gray-500 dark:text-gray-500">
              <VolumeX className="w-4 h-4" />
              <span>Sound guidance disabled</span>
            </div>
          )}
        </div>

        {/* Instructions */}
        <div className="px-6 pb-6">
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
            <h4 className="font-medium text-blue-800 dark:text-blue-300 mb-2">How it works:</h4>
            <div className="text-sm text-blue-700 dark:text-blue-400 space-y-1">
              {type === '4-7-8' ? (
                <>
                  <p>• Inhale through your nose for 4 seconds</p>
                  <p>• Hold your breath for 7 seconds</p>
                  <p>• Exhale through your mouth for 8 seconds</p>
                  <p>• Repeat for {totalCycles} cycles to promote relaxation</p>
                </>
              ) : (
                <>
                  <p>• Inhale for 4 seconds</p>
                  <p>• Hold for 4 seconds</p>
                  <p>• Exhale for 4 seconds</p>
                  <p>• Hold empty for 4 seconds</p>
                  <p>• Repeat for {totalCycles} cycles for balanced breathing</p>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};