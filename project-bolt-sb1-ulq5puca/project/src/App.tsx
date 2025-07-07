import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Play, Pause, Download, Volume2, Settings, Globe, User, Mic, RotateCcw, Copy, FileText, AlertCircle, RefreshCw, CheckCircle } from 'lucide-react';

interface Voice {
  id: string;
  name: string;
  lang: string;
  gender: 'male' | 'female';
  description: string;
  accent?: string;
}

interface SystemVoiceInfo {
  voice: SpeechSynthesisVoice;
  isAvailable: boolean;
  quality: 'high' | 'medium' | 'low';
}

const PRESET_VOICES: Voice[] = [
  { id: 'en-US-1', name: 'Alex', lang: 'en-US', gender: 'male', description: 'Professional American Male', accent: 'American' },
  { id: 'en-US-2', name: 'Emma', lang: 'en-US', gender: 'female', description: 'Clear American Female', accent: 'American' },
  { id: 'en-GB-1', name: 'Oliver', lang: 'en-GB', gender: 'male', description: 'British Male', accent: 'British' },
  { id: 'en-GB-2', name: 'Charlotte', lang: 'en-GB', gender: 'female', description: 'British Female', accent: 'British' },
  { id: 'en-AU-1', name: 'William', lang: 'en-AU', gender: 'male', description: 'Australian Male', accent: 'Australian' },
  { id: 'en-AU-2', name: 'Sophie', lang: 'en-AU', gender: 'female', description: 'Australian Female', accent: 'Australian' },
  { id: 'hi-IN-1', name: 'Raj', lang: 'hi-IN', gender: 'male', description: 'Hindi Male Voice', accent: 'Indian' },
  { id: 'hi-IN-2', name: 'Priya', lang: 'hi-IN', gender: 'female', description: 'Hindi Female Voice', accent: 'Indian' },
];

function App() {
  const [text, setText] = useState('Welcome to JVoice AI by Jaideep! This is a sample text to demonstrate our realistic text-to-speech technology.');
  const [isPlaying, setIsPlaying] = useState(false);
  const [selectedVoice, setSelectedVoice] = useState<Voice>(PRESET_VOICES[0]);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceMapping, setVoiceMapping] = useState<Map<string, SystemVoiceInfo>>(new Map());
  const [rate, setRate] = useState(1);
  const [pitch, setPitch] = useState(1);
  const [volume, setVolume] = useState(1);
  const [currentUtterance, setCurrentUtterance] = useState<SpeechSynthesisUtterance | null>(null);
  const [isAdvancedMode, setIsAdvancedMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [charCount, setCharCount] = useState(0);
  const [voicesLoaded, setVoicesLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [voiceLoadAttempts, setVoiceLoadAttempts] = useState(0);
  const [systemStatus, setSystemStatus] = useState<string>('Initializing...');
  const [lastSuccessfulVoice, setLastSuccessfulVoice] = useState<SpeechSynthesisVoice | null>(null);
  
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
  const voiceLoadTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const speechTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Enhanced voice quality assessment
  const assessVoiceQuality = useCallback((voice: SpeechSynthesisVoice): 'high' | 'medium' | 'low' => {
    // Local voices are generally higher quality
    if (voice.localService) return 'high';
    
    // Check for premium voice indicators
    const premiumIndicators = ['premium', 'neural', 'wavenet', 'enhanced', 'natural'];
    if (premiumIndicators.some(indicator => voice.name.toLowerCase().includes(indicator))) {
      return 'high';
    }
    
    // Default voices are usually medium quality
    if (voice.default) return 'medium';
    
    return 'low';
  }, []);

  // Comprehensive voice loading with multiple strategies
  const loadVoices = useCallback(async (): Promise<boolean> => {
    console.log(`🔄 Loading voices - Attempt ${voiceLoadAttempts + 1}`);
    setSystemStatus(`Loading voices (attempt ${voiceLoadAttempts + 1})...`);
    
    try {
      // Strategy 1: Direct getVoices call
      let voices = speechSynthesis.getVoices();
      
      // Strategy 2: Force refresh if no voices found
      if (voices.length === 0) {
        console.log('🔄 No voices found, forcing refresh...');
        speechSynthesis.cancel();
        await new Promise(resolve => setTimeout(resolve, 100));
        voices = speechSynthesis.getVoices();
      }
      
      // Strategy 3: Trigger voices changed event
      if (voices.length === 0) {
        console.log('🔄 Triggering voiceschanged event...');
        const event = new Event('voiceschanged');
        speechSynthesis.dispatchEvent(event);
        await new Promise(resolve => setTimeout(resolve, 200));
        voices = speechSynthesis.getVoices();
      }
      
      console.log(`📢 Found ${voices.length} system voices`);
      
      if (voices.length > 0) {
        setAvailableVoices(voices);
        
        // Create comprehensive voice mapping
        const mapping = new Map<string, SystemVoiceInfo>();
        
        // Map each preset voice to best available system voice
        PRESET_VOICES.forEach(presetVoice => {
          const systemVoice = findBestSystemVoice(voices, presetVoice);
          if (systemVoice) {
            mapping.set(presetVoice.id, {
              voice: systemVoice,
              isAvailable: true,
              quality: assessVoiceQuality(systemVoice)
            });
            console.log(`✅ Mapped ${presetVoice.name} -> ${systemVoice.name} (${systemVoice.lang})`);
          } else {
            console.log(`❌ No mapping found for ${presetVoice.name}`);
          }
        });
        
        setVoiceMapping(mapping);
        setVoicesLoaded(true);
        setError(null);
        setVoiceLoadAttempts(0);
        setSystemStatus(`Ready - ${voices.length} voices loaded`);
        
        // Log voice statistics
        const hindiVoices = voices.filter(v => 
          v.lang.toLowerCase().includes('hi') || 
          v.name.toLowerCase().includes('hindi') ||
          v.name.toLowerCase().includes('devanagari')
        );
        
        const englishVoices = voices.filter(v => v.lang.toLowerCase().startsWith('en'));
        
        console.log(`📊 Voice Statistics:
          - Total: ${voices.length}
          - English: ${englishVoices.length}
          - Hindi: ${hindiVoices.length}
          - Local: ${voices.filter(v => v.localService).length}
          - Remote: ${voices.filter(v => !v.localService).length}`);
        
        return true;
      }
      
      return false;
    } catch (error) {
      console.error('❌ Error loading voices:', error);
      setSystemStatus('Error loading voices');
      return false;
    }
  }, [voiceLoadAttempts, assessVoiceQuality]);

  // Enhanced voice matching algorithm
  const findBestSystemVoice = useCallback((voices: SpeechSynthesisVoice[], presetVoice: Voice): SpeechSynthesisVoice | null => {
    if (!voices.length) return null;
    
    console.log(`🔍 Finding voice for ${presetVoice.name} (${presetVoice.lang}, ${presetVoice.gender})`);
    
    // Scoring system for voice matching
    const scoreVoice = (voice: SpeechSynthesisVoice): number => {
      let score = 0;
      
      // Language matching (highest priority)
      if (voice.lang === presetVoice.lang) score += 100;
      else if (voice.lang.startsWith(presetVoice.lang.split('-')[0])) score += 80;
      else if (presetVoice.lang.startsWith('hi') && (
        voice.lang.toLowerCase().includes('hi') ||
        voice.name.toLowerCase().includes('hindi') ||
        voice.name.toLowerCase().includes('devanagari')
      )) score += 90;
      
      // Gender matching
      const voiceName = voice.name.toLowerCase();
      const genderKeywords = {
        male: ['male', 'man', 'alex', 'oliver', 'william', 'raj', 'amit', 'vikram', 'david', 'james', 'michael'],
        female: ['female', 'woman', 'emma', 'charlotte', 'sophie', 'priya', 'kavya', 'shreya', 'sarah', 'anna', 'maria']
      };
      
      if (genderKeywords[presetVoice.gender].some(keyword => voiceName.includes(keyword))) {
        score += 50;
      }
      
      // Quality bonuses
      if (voice.localService) score += 30;
      if (voice.default) score += 20;
      
      // Name similarity bonus
      if (voiceName.includes(presetVoice.name.toLowerCase())) score += 40;
      
      // Accent/region matching
      if (presetVoice.accent) {
        const accentMap: Record<string, string[]> = {
          'American': ['us', 'united states', 'america'],
          'British': ['gb', 'uk', 'britain', 'british'],
          'Australian': ['au', 'australia', 'australian'],
          'Indian': ['in', 'india', 'indian']
        };
        
        const accentKeywords = accentMap[presetVoice.accent] || [];
        if (accentKeywords.some(keyword => 
          voice.lang.toLowerCase().includes(keyword) || 
          voiceName.includes(keyword)
        )) {
          score += 25;
        }
      }
      
      return score;
    };
    
    // Find best matching voice
    const scoredVoices = voices
      .map(voice => ({ voice, score: scoreVoice(voice) }))
      .filter(item => item.score > 0)
      .sort((a, b) => b.score - a.score);
    
    if (scoredVoices.length > 0) {
      const bestMatch = scoredVoices[0];
      console.log(`✅ Best match for ${presetVoice.name}: ${bestMatch.voice.name} (score: ${bestMatch.score})`);
      return bestMatch.voice;
    }
    
    // Fallback to any voice with matching language family
    const langFamily = presetVoice.lang.split('-')[0];
    const fallback = voices.find(v => v.lang.startsWith(langFamily));
    if (fallback) {
      console.log(`⚠️ Fallback match for ${presetVoice.name}: ${fallback.name}`);
      return fallback;
    }
    
    console.log(`❌ No suitable voice found for ${presetVoice.name}`);
    return null;
  }, []);

  // Robust voice initialization
  useEffect(() => {
    let mounted = true;
    let retryCount = 0;
    const maxRetries = 20;
    
    const initializeVoices = async () => {
      console.log('🚀 Initializing voice system...');
      
      if (!('speechSynthesis' in window)) {
        setError('Speech synthesis is not supported in this browser. Please try Chrome, Firefox, Safari, or Edge.');
        setSystemStatus('Not supported');
        return;
      }
      
      // Clear any existing timeouts
      if (voiceLoadTimeoutRef.current) {
        clearTimeout(voiceLoadTimeoutRef.current);
      }
      
      const attemptLoad = async () => {
        if (!mounted || retryCount >= maxRetries) {
          if (mounted) {
            setError('Unable to load voices after multiple attempts. Please refresh the page or try a different browser.');
            setSystemStatus('Failed to load');
          }
          return;
        }
        
        setVoiceLoadAttempts(retryCount);
        
        const success = await loadVoices();
        if (success) {
          console.log('✅ Voice system initialized successfully');
          return;
        }
        
        retryCount++;
        const delay = Math.min(500 * Math.pow(1.3, retryCount), 3000);
        console.log(`⏳ Retrying in ${delay}ms...`);
        
        voiceLoadTimeoutRef.current = setTimeout(attemptLoad, delay);
      };
      
      // Set up event listener for voice changes
      const handleVoicesChanged = () => {
        if (mounted) {
          console.log('🔄 Voices changed event received');
          loadVoices();
        }
      };
      
      speechSynthesis.addEventListener('voiceschanged', handleVoicesChanged);
      
      // Start loading process
      await attemptLoad();
      
      // Cleanup function
      return () => {
        mounted = false;
        speechSynthesis.removeEventListener('voiceschanged', handleVoicesChanged);
        if (voiceLoadTimeoutRef.current) {
          clearTimeout(voiceLoadTimeoutRef.current);
        }
      };
    };
    
    initializeVoices();
  }, [loadVoices]);

  // Update word and character count
  useEffect(() => {
    const words = text.trim().split(/\s+/).filter(word => word.length > 0);
    setWordCount(text.trim() === '' ? 0 : words.length);
    setCharCount(text.length);
  }, [text]);

  // Enhanced speech synthesis with comprehensive error handling
  const playText = useCallback(async () => {
    console.log('🎵 Play button clicked');
    setError(null);
    
    try {
      // Validation checks
      if (!text.trim()) {
        throw new Error('Please enter some text to generate speech.');
      }
      
      if (!voicesLoaded) {
        throw new Error('Voices are still loading. Please wait a moment and try again.');
      }
      
      // Stop current speech if playing
      if (isPlaying) {
        console.log('⏹️ Stopping current speech');
        speechSynthesis.cancel();
        setIsPlaying(false);
        setCurrentUtterance(null);
        utteranceRef.current = null;
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        return;
      }
      
      setIsLoading(true);
      setSystemStatus('Preparing speech...');
      
      // Get the mapped system voice
      const voiceInfo = voiceMapping.get(selectedVoice.id);
      let systemVoice: SpeechSynthesisVoice | null = null;
      
      if (voiceInfo && voiceInfo.isAvailable) {
        systemVoice = voiceInfo.voice;
      } else {
        // Fallback to direct matching
        systemVoice = findBestSystemVoice(availableVoices, selectedVoice);
      }
      
      // Ultimate fallback
      if (!systemVoice) {
        systemVoice = lastSuccessfulVoice || availableVoices[0];
      }
      
      if (!systemVoice) {
        throw new Error('No suitable voice found. Please try refreshing the page.');
      }
      
      console.log(`🎤 Using voice: ${systemVoice.name} (${systemVoice.lang})`);
      
      // Cancel any existing speech and wait
      speechSynthesis.cancel();
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Create utterance with optimized settings
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.voice = systemVoice;
      
      // Optimize settings based on voice and language
      if (selectedVoice.lang.startsWith('hi')) {
        // Hindi-specific optimizations
        utterance.rate = Math.max(0.6, rate * 0.85);
        utterance.pitch = Math.max(0.8, pitch * 0.9);
        utterance.volume = volume;
      } else {
        // English and other languages
        utterance.rate = rate;
        utterance.pitch = pitch;
        utterance.volume = volume;
      }
      
      // Enhanced event handlers
      utterance.onstart = () => {
        console.log('✅ Speech started successfully');
        setIsPlaying(true);
        setError(null);
        setIsLoading(false);
        setSystemStatus('Speaking...');
        setLastSuccessfulVoice(systemVoice);
      };
      
      utterance.onend = () => {
        console.log('🏁 Speech completed');
        setIsPlaying(false);
        setCurrentUtterance(null);
        utteranceRef.current = null;
        setIsLoading(false);
        setSystemStatus(`Ready - ${availableVoices.length} voices loaded`);
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
      };
      
      utterance.onerror = (event) => {
        console.error('❌ Speech error:', event.error, event);
        setIsPlaying(false);
        setCurrentUtterance(null);
        utteranceRef.current = null;
        setIsLoading(false);
        setSystemStatus('Error occurred');
        
        if (speechTimeoutRef.current) {
          clearTimeout(speechTimeoutRef.current);
        }
        
        let errorMessage = 'Speech synthesis failed. ';
        switch (event.error) {
          case 'network':
            errorMessage += 'Network error. Please check your connection and try again.';
            break;
          case 'synthesis-failed':
            errorMessage += 'Voice synthesis failed. Try selecting a different voice.';
            break;
          case 'synthesis-unavailable':
            errorMessage += 'Voice synthesis unavailable. Please refresh the page.';
            break;
          case 'audio-busy':
            errorMessage += 'Audio system is busy. Please wait and try again.';
            break;
          case 'not-allowed':
            errorMessage += 'Audio not allowed. Please check browser permissions.';
            break;
          case 'interrupted':
            errorMessage += 'Speech was interrupted. Please try again.';
            break;
          default:
            errorMessage += `Unknown error (${event.error}). Please try again or select a different voice.`;
        }
        setError(errorMessage);
      };
      
      utterance.onpause = () => {
        console.log('⏸️ Speech paused');
        setSystemStatus('Paused');
      };
      
      utterance.onresume = () => {
        console.log('▶️ Speech resumed');
        setSystemStatus('Speaking...');
      };
      
      // Store references
      setCurrentUtterance(utterance);
      utteranceRef.current = utterance;
      
      // Start speech synthesis
      console.log('🎬 Starting speech synthesis...');
      speechSynthesis.speak(utterance);
      
      // Safety timeout to prevent hanging
      speechTimeoutRef.current = setTimeout(() => {
        if (utteranceRef.current === utterance && isPlaying) {
          console.log('⏰ Speech timeout - forcing stop');
          speechSynthesis.cancel();
          setError('Speech synthesis timed out. Please try again with a different voice.');
          setIsPlaying(false);
          setCurrentUtterance(null);
          utteranceRef.current = null;
          setIsLoading(false);
          setSystemStatus('Timeout occurred');
        }
      }, Math.max(10000, text.length * 100)); // Dynamic timeout based on text length
      
    } catch (err) {
      console.error('❌ Error in playText:', err);
      setError(err instanceof Error ? err.message : 'An unexpected error occurred.');
      setIsPlaying(false);
      setCurrentUtterance(null);
      utteranceRef.current = null;
      setIsLoading(false);
      setSystemStatus('Error occurred');
      
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    }
  }, [text, voicesLoaded, isPlaying, selectedVoice, rate, pitch, volume, voiceMapping, availableVoices, findBestSystemVoice, lastSuccessfulVoice]);

  // Force reload voices with complete reset
  const reloadVoices = useCallback(() => {
    console.log('🔄 Force reloading voice system...');
    
    // Cancel all ongoing operations
    speechSynthesis.cancel();
    setIsPlaying(false);
    setCurrentUtterance(null);
    utteranceRef.current = null;
    
    // Clear timeouts
    if (voiceLoadTimeoutRef.current) {
      clearTimeout(voiceLoadTimeoutRef.current);
    }
    if (speechTimeoutRef.current) {
      clearTimeout(speechTimeoutRef.current);
    }
    
    // Reset state
    setVoicesLoaded(false);
    setAvailableVoices([]);
    setVoiceMapping(new Map());
    setVoiceLoadAttempts(0);
    setError(null);
    setIsLoading(false);
    setSystemStatus('Reloading...');
    setLastSuccessfulVoice(null);
    
    // Force browser to reload voices
    speechSynthesis.getVoices();
    
    // Trigger reload
    setTimeout(() => {
      loadVoices();
    }, 100);
  }, [loadVoices]);

  const downloadAudio = () => {
    if (!text.trim()) {
      setError('Please enter some text first.');
      return;
    }
    
    setError('Audio download feature requires server-side TTS processing. This demo uses browser TTS for real-time playback. For downloadable audio files, consider integrating with services like Google Cloud TTS, Amazon Polly, or Azure Cognitive Services.');
    
    setTimeout(() => {
      setError(null);
    }, 8000);
  };

  const copyText = () => {
    if (navigator.clipboard) {
      navigator.clipboard.writeText(text).then(() => {
        setSystemStatus('Text copied to clipboard');
        setTimeout(() => {
          setSystemStatus(`Ready - ${availableVoices.length} voices loaded`);
        }, 2000);
      }).catch(() => {
        fallbackCopy();
      });
    } else {
      fallbackCopy();
    }
  };

  const fallbackCopy = () => {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.select();
    document.execCommand('copy');
    document.body.removeChild(textArea);
    setSystemStatus('Text copied to clipboard');
    setTimeout(() => {
      setSystemStatus(`Ready - ${availableVoices.length} voices loaded`);
    }, 2000);
  };

  const clearText = () => {
    setText('');
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  const sampleTexts = {
    'en-US': 'Hello! Welcome to JVoice AI by Jaideep. This advanced text-to-speech generator provides realistic AI voices for unlimited text conversion with professional quality output.',
    'en-GB': 'Good day! Welcome to JVoice AI by Jaideep. This British English voice synthesis technology delivers natural-sounding speech with authentic pronunciation.',
    'en-AU': 'G\'day mate! JVoice AI by Jaideep demonstrates advanced text-to-speech capabilities with natural intonation and authentic accent reproduction.',
    'hi-IN': 'नमस्ते! जयदीप के JVoice AI में आपका स्वागत है। यह उन्नत टेक्स्ट-टू-स्पीच जेनरेटर असीमित टेक्स्ट रूपांतरण के लिए यथार्थवादी AI आवाज़ें प्रदान करता है। यह हिंदी भाषा में उच्च गुणवत्ता की आवाज़ संश्लेषण प्रदान करता है।'
  };

  const insertSample = () => {
    const sample = sampleTexts[selectedVoice.lang as keyof typeof sampleTexts] || sampleTexts['en-US'];
    setText(sample);
  };

  // Test voice function
  const testVoice = useCallback(async (voice: Voice) => {
    const testText = voice.lang.startsWith('hi') 
      ? 'नमस्ते, यह एक परीक्षण है।' 
      : 'Hello, this is a voice test.';
    
    const originalText = text;
    setText(testText);
    setSelectedVoice(voice);
    
    // Wait a bit then trigger speech
    setTimeout(() => {
      playText();
      // Restore original text after test
      setTimeout(() => {
        setText(originalText);
      }, 3000);
    }, 100);
  }, [text, playText]);

  const voicesByLanguage = PRESET_VOICES.reduce((acc, voice) => {
    const lang = voice.lang.split('-')[0];
    if (!acc[lang]) acc[lang] = [];
    acc[lang].push(voice);
    return acc;
  }, {} as Record<string, Voice[]>);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      speechSynthesis.cancel();
      if (voiceLoadTimeoutRef.current) {
        clearTimeout(voiceLoadTimeoutRef.current);
      }
      if (speechTimeoutRef.current) {
        clearTimeout(speechTimeoutRef.current);
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-4">
            <div className="flex items-center space-x-3">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-3 rounded-xl shadow-lg">
                <span className="text-2xl font-bold text-white">J</span>
              </div>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">JVoice AI</h1>
                <p className="text-sm text-gray-600">by Jaideep • Unlimited Free TTS</p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className={`px-3 py-1 rounded-full text-sm font-medium ${
                voicesLoaded ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
              }`}>
                {systemStatus}
              </div>
              <button
                onClick={reloadVoices}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-3 py-2 rounded-lg transition-colors"
                title="Reload voices"
              >
                <RefreshCw className="h-4 w-4" />
              </button>
              <button
                onClick={() => setIsAdvancedMode(!isAdvancedMode)}
                className="flex items-center space-x-2 bg-gray-100 hover:bg-gray-200 px-4 py-2 rounded-lg transition-colors"
              >
                <Settings className="h-4 w-4" />
                <span className="hidden sm:inline">Advanced</span>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center space-x-2">
            <AlertCircle className="h-5 w-5 text-red-500 flex-shrink-0" />
            <p className="text-red-700 flex-1">{error}</p>
            <button
              onClick={() => setError(null)}
              className="ml-auto text-red-500 hover:text-red-700 text-xl font-bold"
            >
              ×
            </button>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Text Input */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-900 flex items-center">
                  <FileText className="h-5 w-5 mr-2" />
                  Text Input
                </h2>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={insertSample}
                    className="text-sm bg-blue-50 hover:bg-blue-100 text-blue-600 px-3 py-1 rounded-md transition-colors"
                  >
                    Sample
                  </button>
                  <button
                    onClick={copyText}
                    className="text-sm bg-gray-50 hover:bg-gray-100 text-gray-600 px-3 py-1 rounded-md transition-colors flex items-center"
                  >
                    <Copy className="h-3 w-3 mr-1" />
                    Copy
                  </button>
                  <button
                    onClick={clearText}
                    className="text-sm bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1 rounded-md transition-colors flex items-center"
                  >
                    <RotateCcw className="h-3 w-3 mr-1" />
                    Clear
                  </button>
                </div>
              </div>
              
              <textarea
                ref={textareaRef}
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Enter your text here... No limits, unlimited generation! हिंदी टेक्स्ट भी समर्थित है।"
                className="w-full h-40 p-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              />
              
              <div className="flex justify-between items-center mt-3 text-sm text-gray-600">
                <div className="flex space-x-4">
                  <span>{wordCount} words</span>
                  <span>{charCount} characters</span>
                </div>
                <div className="text-green-600 font-medium">
                  ✓ Unlimited Text Length
                </div>
              </div>
            </div>

            {/* Controls */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <div className="flex flex-col sm:flex-row gap-4">
                <button
                  onClick={playText}
                  disabled={!text.trim() || (!voicesLoaded && !isLoading)}
                  className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-all flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <RefreshCw className="h-5 w-5 animate-spin" />
                      <span>Loading...</span>
                    </>
                  ) : isPlaying ? (
                    <>
                      <Pause className="h-5 w-5" />
                      <span>Stop Voice</span>
                    </>
                  ) : (
                    <>
                      <Play className="h-5 w-5" />
                      <span>Generate Voice</span>
                    </>
                  )}
                </button>
                
                <button
                  onClick={downloadAudio}
                  disabled={!text.trim()}
                  className="flex-1 sm:flex-none bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 py-3 rounded-lg font-medium transition-colors flex items-center justify-center space-x-2 disabled:cursor-not-allowed"
                >
                  <Download className="h-5 w-5" />
                  <span>Download</span>
                </button>
              </div>
            </div>

            {/* Advanced Controls */}
            {isAdvancedMode && (
              <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Advanced Settings</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Speed: {rate.toFixed(1)}x
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={rate}
                      onChange={(e) => setRate(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Slow</span>
                      <span>Fast</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Pitch: {pitch.toFixed(1)}
                    </label>
                    <input
                      type="range"
                      min="0.5"
                      max="2"
                      step="0.1"
                      value={pitch}
                      onChange={(e) => setPitch(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Low</span>
                      <span>High</span>
                    </div>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Volume: {Math.round(volume * 100)}%
                    </label>
                    <input
                      type="range"
                      min="0"
                      max="1"
                      step="0.1"
                      value={volume}
                      onChange={(e) => setVolume(parseFloat(e.target.value))}
                      className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer slider"
                    />
                    <div className="flex justify-between text-xs text-gray-500 mt-1">
                      <span>Quiet</span>
                      <span>Loud</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Voice Selection */}
          <div className="space-y-6">
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Mic className="h-5 w-5 mr-2" />
                Voice Selection
              </h2>

              {Object.entries(voicesByLanguage).map(([lang, voices]) => (
                <div key={lang} className="mb-6">
                  <div className="flex items-center mb-3">
                    <Globe className="h-4 w-4 mr-2 text-gray-500" />
                    <h3 className="font-medium text-gray-800 capitalize">
                      {lang === 'en' ? 'English' : 'हिंदी (Hindi)'}
                    </h3>
                  </div>
                  
                  <div className="space-y-2">
                    {voices.map((voice) => {
                      const voiceInfo = voiceMapping.get(voice.id);
                      const isAvailable = voiceInfo?.isAvailable || false;
                      const quality = voiceInfo?.quality || 'unknown';
                      
                      return (
                        <div key={voice.id} className="relative">
                          <button
                            onClick={() => setSelectedVoice(voice)}
                            className={`w-full text-left p-3 rounded-lg border transition-all ${
                              selectedVoice.id === voice.id
                                ? 'bg-blue-50 border-blue-200 ring-2 ring-blue-500'
                                : 'bg-gray-50 border-gray-200 hover:bg-gray-100'
                            } ${!isAvailable ? 'opacity-60' : ''}`}
                          >
                            <div className="flex items-center justify-between">
                              <div className="flex-1">
                                <div className="flex items-center space-x-2">
                                  <User className="h-4 w-4 text-gray-500" />
                                  <span className="font-medium text-gray-900">{voice.name}</span>
                                  <span className={`px-2 py-1 rounded-full text-xs ${
                                    voice.gender === 'male' 
                                      ? 'bg-blue-100 text-blue-800' 
                                      : 'bg-pink-100 text-pink-800'
                                  }`}>
                                    {voice.gender}
                                  </span>
                                  {isAvailable && (
                                    <span className={`px-2 py-1 rounded-full text-xs ${
                                      quality === 'high' ? 'bg-green-100 text-green-800' :
                                      quality === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                      'bg-gray-100 text-gray-800'
                                    }`}>
                                      {quality}
                                    </span>
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">{voice.description}</p>
                                {voice.accent && (
                                  <p className="text-xs text-gray-500 mt-1">{voice.accent} Accent</p>
                                )}
                                {voiceInfo && (
                                  <p className="text-xs text-gray-400 mt-1">
                                    Mapped to: {voiceInfo.voice.name}
                                  </p>
                                )}
                              </div>
                              <div className="flex flex-col items-center space-y-1">
                                {isAvailable ? (
                                  <CheckCircle className="h-5 w-5 text-green-500" />
                                ) : (
                                  <AlertCircle className="h-5 w-5 text-red-500" />
                                )}
                                <button
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    testVoice(voice);
                                  }}
                                  disabled={!isAvailable}
                                  className="text-xs bg-blue-100 hover:bg-blue-200 text-blue-600 px-2 py-1 rounded disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  Test
                                </button>
                              </div>
                            </div>
                          </button>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>

            {/* System Status */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">System Status</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Speech Synthesis</span>
                  <span className={`text-sm font-medium ${
                    typeof speechSynthesis !== 'undefined' ? 'text-green-600' : 'text-red-600'
                  }`}>
                    {typeof speechSynthesis !== 'undefined' ? '✅ Available' : '❌ Not Available'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voices Loaded</span>
                  <span className={`text-sm font-medium ${
                    voicesLoaded ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {voicesLoaded ? `✅ ${availableVoices.length} voices` : '⏳ Loading...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Voice Mapping</span>
                  <span className={`text-sm font-medium ${
                    voiceMapping.size > 0 ? 'text-green-600' : 'text-gray-600'
                  }`}>
                    {voiceMapping.size > 0 ? `✅ ${voiceMapping.size} mapped` : '⏳ Mapping...'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Hindi Support</span>
                  <span className={`text-sm font-medium ${
                    availableVoices.some(v => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'))
                      ? 'text-green-600' : 'text-yellow-600'
                  }`}>
                    {availableVoices.some(v => v.lang.toLowerCase().includes('hi') || v.name.toLowerCase().includes('hindi'))
                      ? '✅ Available' : '⚠️ Limited'}
                  </span>
                </div>
              </div>
            </div>

            {/* Features */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">✨ Features</h3>
              <div className="space-y-3">
                {[
                  'Unlimited text length',
                  'Robust voice selection',
                  'Enhanced error handling',
                  'Voice quality assessment',
                  'Automatic voice mapping',
                  'Real-time voice testing',
                  'Cross-browser compatibility',
                  'Hindi & English support',
                  'Advanced speech controls',
                  'Production-ready reliability'
                ].map((feature, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span className="text-sm text-gray-700">{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-50 border-t border-gray-200 mt-12">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="text-center">
            <p className="text-gray-600 mb-2">
              JVoice AI by Jaideep - Professional Text-to-Speech Generator
            </p>
            <p className="text-sm text-gray-500">
              Unlimited • Free • No Limits • Production Ready • Robust
            </p>
            <p className="text-xs text-gray-400 mt-2">
              Created with ❤️ by Jaideep
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;