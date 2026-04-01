import React, { useState, useEffect, useMemo } from 'react';
import { 
  Dog, Cat, LayoutDashboard, MoreVertical, User, ShieldCheck, 
  FileText, History, Moon, Sun, LogOut, Heart, QrCode, Image as ImageIcon, 
  Navigation, Settings, RefreshCw, Activity, MapPin, X, Check, ChevronRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// --- Types ---
interface FeedingLog {
  id: string;
  location: string;
  type: 'Dog' | 'Cat';
  coins: number;
  grams: number;
  timestamp: string;
}

interface UserProfile {
  name: string;
  role: 'viewer' | 'admin' | 'main';
  username: string;
  bio: string;
}

interface LocationDetail {
  address: string;
}

// --- Constants ---
const LOCATIONS = ['Alijis', 'Granada', 'Mansilingan', 'Sum-ag'];
const LOCATION_DETAILS: Record<string, LocationDetail> = {
  'Alijis': { address: 'Alijis Road, Bacolod City' },
  'Granada': { address: 'Granada-Alangilan Road, Bacolod City' },
  'Mansilingan': { address: 'Mansilingan Main Road, Bacolod City' },
  'Sum-ag': { address: 'Sum-ag Highway, Bacolod City' }
};

const INITIAL_LOGS: FeedingLog[] = [
  { id: '1', location: 'Alijis', type: 'Dog', coins: 5, grams: 10, timestamp: new Date().toISOString() },
  { id: '2', location: 'Alijis', type: 'Cat', coins: 1, grams: 2, timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString() },
  { id: '3', location: 'Granada', type: 'Dog', coins: 10, grams: 20, timestamp: new Date(Date.now() - 1000 * 60 * 15).toISOString() }
];

const GALLERY_IMAGES = [
  'https://picsum.photos/seed/p1/400/400',
  'https://picsum.photos/seed/p2/400/400',
  'https://picsum.photos/seed/p3/400/400',
  'https://picsum.photos/seed/p4/400/400',
  'https://picsum.photos/seed/p5/400/400',
  'https://picsum.photos/seed/p6/400/400'
];

// --- Components ---

const App: React.FC = () => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [authMode, setAuthMode] = useState<'viewer' | 'login' | 'signup'>('viewer');
  const [darkMode, setDarkMode] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState('Alijis');
  const [simulatedType, setSimulatedType] = useState<'Dog' | 'Cat'>('Dog');
  const [logs, setLogs] = useState<FeedingLog[]>(INITIAL_LOGS);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isGalleryOpen, setIsGalleryOpen] = useState(false);
  const [notification, setNotification] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  // Auth Form State
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');

  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  const showNotification = (msg: string, type: 'success' | 'error' = 'success') => {
    setNotification({ msg, type });
  };

  // --- Animation Variants ---
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 24 }
    }
  };

  const modalVariants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: { 
      opacity: 1, 
      scale: 1, 
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 28 }
    },
    exit: { 
      opacity: 0, 
      scale: 0.95, 
      y: 20,
      transition: { duration: 0.2, ease: "easeIn" }
    }
  };

  const handleAuth = (e: React.FormEvent) => {
    e.preventDefault();
    const role = username === 'main' ? 'main' : 'admin';
    setUser({
      name: fullName || username,
      role: role,
      username: username,
      bio: 'Smart Feeding Network Administrator'
    });
    showNotification(authMode === 'login' ? 'Login successful!' : 'Signup successful!');
  };

  const enterAsViewer = () => {
    setUser({ name: 'Public Viewer', role: 'viewer', username: 'viewer', bio: 'Viewer' });
  };

  const signOut = () => {
    setUser(null);
    setIsMenuOpen(false);
    setAuthMode('viewer');
  };

  const simulateDispense = () => {
    const coinsInput = document.getElementById('sim-coins') as HTMLInputElement;
    const coins = parseInt(coinsInput?.value) || 1;
    
    setIsProcessing(true);
    
    setTimeout(() => {
      const newLog: FeedingLog = {
        id: Date.now().toString(),
        location: selectedLocation,
        type: simulatedType,
        coins: coins,
        grams: coins * 2,
        timestamp: new Date().toISOString()
      };
      setLogs(prev => [newLog, ...prev]);
      setIsProcessing(false);
      showNotification(`Simulated ${coins} peso(s) for ${simulatedType}s`);
    }, 1000);
  };

  const filteredLogs = useMemo(() => 
    logs.filter(l => l.location === selectedLocation),
  [logs, selectedLocation]);

  const stats = useMemo(() => {
    const dogGrams = filteredLogs.filter(l => l.type === 'Dog').reduce((a, b) => a + b.grams, 0);
    const catGrams = filteredLogs.filter(l => l.type === 'Cat').reduce((a, b) => a + b.grams, 0);
    const totalCoins = filteredLogs.reduce((a, b) => a + b.coins, 0);
    return { dogGrams, catGrams, totalCoins, count: filteredLogs.length };
  }, [filteredLogs]);

  if (!user) {
    return (
      <AnimatePresence mode="wait">
        <motion.div 
          key="auth-screen"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className={`min-h-screen flex items-center justify-center p-6 relative overflow-hidden transition-colors duration-1000 ${darkMode ? 'bg-black' : 'bg-[#F5F5F7]'}`}
        >
          {/* Animated Background Orbs */}
          <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden">
            <motion.div 
              animate={{ 
                scale: [1, 1.2, 1],
                rotate: [0, 90, 0],
                x: [0, 100, 0],
                y: [0, 50, 0]
              }}
              transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
              className="absolute -top-48 -left-48 w-[40rem] h-[40rem] bg-[#6A59CC]/10 rounded-full blur-[100px]"
            />
            <motion.div 
              animate={{ 
                scale: [1.2, 1, 1.2],
                rotate: [90, 0, 90],
                x: [0, -100, 0],
                y: [0, -50, 0]
              }}
              transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-48 -right-48 w-[40rem] h-[40rem] bg-[#4ECDC4]/10 rounded-full blur-[100px]"
            />
          </div>

          <motion.div 
            variants={modalVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className={`w-full max-w-md p-10 rounded-[3rem] shadow-2xl relative z-10 border transition-all duration-700 ${darkMode ? 'bg-white/5 border-white/10 backdrop-blur-3xl' : 'bg-white/80 border-white/20 backdrop-blur-3xl'}`}
          >
            <div className="relative z-10">
              <div className="text-center mb-12">
                <motion.div 
                  whileHover={{ scale: 1.05, rotate: 5 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-24 h-24 bg-[#6A59CC] rounded-[2.5rem] flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-[#6A59CC]/30 relative group"
                >
                  <div className="absolute inset-0 bg-white/20 rounded-[2.5rem] scale-0 group-hover:scale-100 transition-transform duration-500 blur-xl" />
                  <Heart className="text-white w-12 h-12 relative z-10" />
                </motion.div>
                <h1 className={`text-5xl font-black tracking-tighter mb-3 transition-colors ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}>PawFeeds</h1>
                <p className="text-[#8E8E93] font-black text-[10px] uppercase tracking-[0.3em]">Smart Feeding Network</p>
              </div>

            <div className={`flex p-1 rounded-2xl mb-10 transition-colors ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
              {(['viewer', 'login', 'signup'] as const).map((mode) => (
                <button
                  key={mode}
                  onClick={() => setAuthMode(mode)}
                  className={`flex-1 py-3.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all relative ${authMode === mode ? (darkMode ? 'text-white' : 'text-[#6A59CC]') : 'text-[#8E8E93] hover:text-[#1D1D1F]'}`}
                >
                  {authMode === mode && (
                    <motion.div 
                      layoutId="auth-tab"
                      className={`absolute inset-0 rounded-xl shadow-sm ${darkMode ? 'bg-white/10' : 'bg-white'}`}
                      transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                    />
                  )}
                  <span className="relative z-10">{mode}</span>
                </button>
              ))}
            </div>

            <AnimatePresence mode="wait">
              {authMode === 'viewer' ? (
                <motion.div
                  key="viewer-mode"
                  initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  className="space-y-8"
                >
                  <div className={`p-8 rounded-[2rem] border transition-colors ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#6A59CC]/5 border-[#6A59CC]/10'}`}>
                    <p className={`text-sm text-center font-bold leading-relaxed ${darkMode ? 'text-white/60' : 'text-[#6A59CC]'}`}>
                      Access the public dashboard to view real-time feeding statistics and machine status across all locations.
                    </p>
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={enterAsViewer}
                    className="w-full py-6 bg-[#1D1D1F] dark:bg-white dark:text-black text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-black/20 flex items-center justify-center gap-3 group"
                  >
                    Enter Dashboard 
                    <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </motion.button>
                </motion.div>
              ) : (
                <motion.form
                  key={authMode}
                  initial={{ opacity: 0, x: 20, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, x: 0, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, x: -20, filter: 'blur(10px)' }}
                  onSubmit={handleAuth}
                  className="space-y-6"
                >
                  {authMode === 'signup' && (
                    <div className="space-y-2">
                      <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-5">Full Name</label>
                      <input 
                        type="text" 
                        required
                        value={fullName}
                        onChange={(e) => setFullName(e.target.value)}
                        placeholder="John Doe"
                        className={`w-full px-8 py-5 rounded-[2rem] border outline-none focus:ring-4 focus:ring-[#6A59CC]/20 transition-all font-bold ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/5 text-[#1D1D1F] placeholder:text-black/20'}`}
                      />
                    </div>
                  )}
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-5">Username</label>
                    <input 
                      type="text" 
                      required
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      placeholder="admin"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none focus:ring-4 focus:ring-[#6A59CC]/20 transition-all font-bold ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/5 text-[#1D1D1F] placeholder:text-black/20'}`}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest ml-5">Password</label>
                    <input 
                      type="password" 
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className={`w-full px-8 py-5 rounded-[2rem] border outline-none focus:ring-4 focus:ring-[#6A59CC]/20 transition-all font-bold ${darkMode ? 'bg-white/5 border-white/10 text-white placeholder:text-white/20' : 'bg-white border-black/5 text-[#1D1D1F] placeholder:text-black/20'}`}
                    />
                  </div>
                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    type="submit"
                    className="w-full py-6 bg-[#6A59CC] text-white rounded-[2rem] font-black text-sm shadow-2xl shadow-[#6A59CC]/30 mt-4"
                  >
                    {authMode === 'login' ? 'Sign In' : 'Create Account'}
                  </motion.button>
                </motion.form>
              )}
            </AnimatePresence>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}

  return (
    <div className={`min-h-screen transition-colors duration-500 ${darkMode ? 'bg-black text-white' : 'bg-[#F5F5F7] text-[#1D1D1F]'}`}>
      {/* Top Bar */}
      <header className={`sticky top-0 z-50 border-b px-8 py-5 flex justify-between items-center backdrop-blur-3xl transition-all duration-700 ${darkMode ? 'bg-black/80 border-white/10' : 'bg-white/80 border-[#D2D2D7]'}`}>
        <div className="flex items-center gap-5">
          <motion.div 
            whileHover={{ scale: 1.1, rotate: 5 }}
            whileTap={{ scale: 0.9 }}
            className="bg-[#6A59CC] p-3 rounded-[1.5rem] shadow-2xl shadow-[#6A59CC]/30"
          >
            <LayoutDashboard className="text-white w-6 h-6" />
          </motion.div>
          <div>
            <h1 className="text-3xl font-black tracking-tighter leading-none mb-1">PawFeeds</h1>
            <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-[0.3em]">Smart Feeding Network</p>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`hidden sm:flex items-center gap-3 px-5 py-2.5 rounded-full text-[10px] font-black border transition-all ${darkMode ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' : 'bg-emerald-50 text-emerald-600 border-emerald-200'}`}
          >
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_rgba(16,185,129,0.5)]"></div>
            LIVE NETWORK
          </motion.div>
          
          <div className="relative">
            <motion.button 
              whileHover={{ scale: 1.05, backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`p-3.5 rounded-2xl transition-all ${darkMode ? 'text-white' : 'text-[#1D1D1F]'}`}
            >
              <MoreVertical className="w-6 h-6" />
            </motion.button>
            
            <AnimatePresence>
              {isMenuOpen && (
                <motion.div 
                  initial={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                  animate={{ opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' }}
                  exit={{ opacity: 0, y: 15, scale: 0.9, filter: 'blur(10px)' }}
                  transition={{ type: "spring", damping: 25, stiffness: 200 }}
                  className={`absolute right-0 mt-4 w-72 rounded-[2.5rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] z-50 border overflow-hidden ${darkMode ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-[#D2D2D7]'}`}
                >
                  <div className={`p-6 border-b ${darkMode ? 'border-white/10' : 'border-[#D2D2D7]'}`}>
                    <p className="text-xs font-bold text-[#8E8E93]">Logged in as</p>
                    <p className="font-bold text-sm truncate">{user.name}</p>
                  </div>
                  <div className="p-3">
                    {user.role !== 'viewer' && (
                      <div className="space-y-1">
                        <MenuButton icon={<User className="w-4 h-4" />} label="My Profile" onClick={() => setActiveModal('profile')} darkMode={darkMode} />
                        {user.role === 'main' && (
                          <MenuButton icon={<ShieldCheck className="w-4 h-4" />} label="Admin Requests" onClick={() => setActiveModal('requests')} darkMode={darkMode} />
                        )}
                        <MenuButton icon={<FileText className="w-4 h-4" />} label="Revenue Report" onClick={() => setActiveModal('report')} darkMode={darkMode} />
                        <MenuButton icon={<History className="w-4 h-4" />} label="Login History" onClick={() => setActiveModal('history')} darkMode={darkMode} />
                      </div>
                    )}
                    <MenuButton 
                      icon={darkMode ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />} 
                      label={darkMode ? "Light Mode" : "Dark Mode"} 
                      onClick={() => setDarkMode(!darkMode)} 
                      darkMode={darkMode} 
                    />
                    <hr className={`my-2 ${darkMode ? 'border-white/10' : 'border-[#D2D2D7]'}`} />
                    <MenuButton icon={<LogOut className="w-4 h-4" />} label="Sign Out" onClick={signOut} danger darkMode={darkMode} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-6 space-y-10">
        {/* Hero Section */}
        <motion.section 
          initial={{ opacity: 0, y: 40 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ type: "spring", damping: 25, stiffness: 100 }}
          className={`rounded-[4rem] border shadow-[0_32px_64px_rgba(0,0,0,0.05)] relative overflow-hidden transition-colors duration-700 ${darkMode ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-[#D2D2D7]'}`}
        >
          <div className="h-80 w-full relative group/banner overflow-hidden">
            <motion.img 
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              src="https://picsum.photos/seed/pawfeeds-banner/1920/600" 
              alt="Banner" 
              className="w-full h-full object-cover opacity-60" 
              referrerPolicy="no-referrer"
            />
            <div className={`absolute inset-0 ${darkMode ? 'bg-black/40' : 'bg-black/5'}`}></div>
          </div>
          
          <div className="px-12 pb-12 relative z-10">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-10 -mt-24 mb-12">
              <motion.div 
                initial={{ opacity: 0, scale: 0.8, y: 20 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ type: "spring", damping: 20, stiffness: 100, delay: 0.2 }}
                whileHover={{ scale: 1.05, rotate: 2 }}
                className="w-48 h-48 rounded-[4rem] overflow-hidden shadow-2xl border-[12px] border-white shrink-0 bg-white"
              >
                <img src="https://picsum.photos/seed/pawfeeds-logo/400/400" alt="Logo" className="w-full h-full object-cover" referrerPolicy="no-referrer" />
              </motion.div>
              <div className="flex-1 pt-6 md:pt-0">
                <motion.h2 
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 }}
                  className="text-5xl md:text-7xl font-black mb-4 tracking-tighter leading-none"
                >
                  Hello, <span className="text-[#6A59CC]">{user.name.split(' ')[0]}</span>! 🐾
                </motion.h2>
                <motion.div 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="flex items-center gap-3"
                >
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.8)] animate-pulse"></div>
                  <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-[0.3em]">Network Status: All Systems Operational</p>
                </motion.div>
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-16 items-start">
              <div className="lg:col-span-2 space-y-8">
                <motion.p 
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className={`text-2xl leading-relaxed font-medium ${darkMode ? 'text-white/60' : 'text-[#8E8E93]'}`}
                >
                  Monitoring the stray feeding network in real-time. Each coin inserted dispenses 2 grams of high-quality pet food. Our automated systems ensure no stray goes hungry in your community.
                </motion.p>
                <div className="flex flex-wrap gap-4">
                  <div className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/5 text-black/60'}`}>
                    Active Nodes: 12
                  </div>
                  <div className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/5 text-black/60'}`}>
                    Total Dispensed: 45.2kg
                  </div>
                  <div className={`px-6 py-3 rounded-2xl border text-[10px] font-black uppercase tracking-widest ${darkMode ? 'bg-white/5 border-white/10 text-white/60' : 'bg-black/5 border-black/5 text-black/60'}`}>
                    Community Impact: High
                  </div>
                </div>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-2 lg:grid-cols-1 gap-4"
              >
                <div className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#6A59CC]/5 border-[#6A59CC]/10'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#6A59CC] mb-3">Our Mission</h4>
                  <p className={`text-xs leading-relaxed font-bold ${darkMode ? 'text-white/60' : 'text-[#8E8E93]'}`}>To provide accessible and automated feeding solutions for stray animals through smart technology.</p>
                </div>
                <div className={`p-8 rounded-[2.5rem] border transition-all hover:shadow-xl ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#4ECDC4]/5 border-[#4ECDC4]/10'}`}>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-[#4ECDC4] mb-3">Our Vision</h4>
                  <p className={`text-xs leading-relaxed font-bold ${darkMode ? 'text-white/60' : 'text-[#8E8E93]'}`}>A community where every stray animal is well-fed and cared for through sustainable innovation.</p>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.section>

        {/* Quick Actions Section */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          <QuickAction icon={<Heart className="w-6 h-6" />} label="Fund Stray" onClick={() => {}} color="bg-rose-500 text-white" darkMode={darkMode} />
          <QuickAction icon={<ImageIcon className="w-6 h-6" />} label="Gallery" onClick={() => setIsGalleryOpen(true)} color="bg-teal-500 text-white" darkMode={darkMode} />
          <QuickAction icon={<QrCode className="w-6 h-6" />} label="Scan QR" onClick={() => {}} color="bg-amber-500 text-white" darkMode={darkMode} />
          <QuickAction icon={<Activity className="w-6 h-6" />} label="Live Feed" onClick={() => {}} color="bg-indigo-500 text-white" darkMode={darkMode} />
        </div>


        {/* Location Tabs */}
        <div className="flex items-center gap-4 overflow-x-auto pb-6 scrollbar-hide px-2">
          {LOCATIONS.map(loc => (
            <motion.button 
              key={loc}
              whileHover={{ y: -4, scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              onClick={() => setSelectedLocation(loc)}
              className={`px-10 py-5 rounded-[2rem] font-black text-[10px] uppercase tracking-widest transition-all whitespace-nowrap border flex items-center gap-3 ${selectedLocation === loc ? 'bg-[#6A59CC] text-white border-[#6A59CC] shadow-2xl shadow-[#6A59CC]/30' : darkMode ? 'bg-white/5 text-white/60 border-white/10 hover:border-[#6A59CC]' : 'bg-white text-[#8E8E93] border-black/5 hover:border-[#6A59CC] hover:text-[#6A59CC] shadow-sm'}`}
            >
              <MapPin className={`w-4 h-4 ${selectedLocation === loc ? 'text-white' : 'text-[#6A59CC]'}`} />
              {loc}
            </motion.button>
          ))}
        </div>

        {/* Stats Grid */}
        <AnimatePresence mode="wait">
          {user.role !== 'viewer' && (
            <motion.div 
              key={selectedLocation}
              variants={{
                hidden: { opacity: 0 },
                show: {
                  opacity: 1,
                  transition: {
                    staggerChildren: 0.1
                  }
                }
              }}
              initial="hidden"
              animate="show"
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6"
            >
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard title="Total Revenue" value={`₱${stats.totalCoins.toFixed(2)}`} sub={`${stats.count} sessions`} icon={<QrCode />} color="amber" darkMode={darkMode} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard title="Total Dispensed" value={`${stats.dogGrams + stats.catGrams}g`} sub="Total weight" icon={<Activity />} color="indigo" darkMode={darkMode} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard title="Dog Food" value={`${stats.dogGrams}g`} sub="Dispensed to dogs" icon={<Dog />} color="teal" darkMode={darkMode} />
              </motion.div>
              <motion.div variants={{ hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } }}>
                <StatCard title="Cat Food" value={`${stats.catGrams}g`} sub="Dispensed to cats" icon={<Cat />} color="rose" darkMode={darkMode} />
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Map and Machine Info */}
        {user.role !== 'viewer' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
            <motion.div 
              initial={{ opacity: 0, x: -40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className={`lg:col-span-2 rounded-[4rem] border shadow-[0_32px_64px_rgba(0,0,0,0.05)] overflow-hidden h-[600px] relative transition-colors duration-700 ${darkMode ? 'bg-white/5 border-white/10' : 'bg-gray-100 border-[#D2D2D7]'}`}
            >
              <div className="absolute inset-0 flex flex-col items-center justify-center p-12 text-center">
                <motion.div
                  animate={{ y: [0, -15, 0], rotate: [0, 5, -5, 0] }}
                  transition={{ duration: 6, repeat: Infinity, ease: "easeInOut" }}
                >
                  <Navigation className="w-24 h-24 text-[#6A59CC] mb-8 opacity-10" />
                </motion.div>
                <h4 className="text-3xl font-black mb-4 tracking-tighter">Live Station Map</h4>
                <p className={`text-lg max-w-sm leading-relaxed font-medium ${darkMode ? 'text-white/40' : 'text-[#8E8E93]'}`}>
                  Station location visualization is currently in demo mode. Interactive mapping coming soon.
                </p>
              </div>
              <motion.div 
                initial={{ opacity: 0, y: 30, scale: 0.9 }}
                whileInView={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ delay: 0.5, type: "spring" }}
                className={`absolute top-10 left-10 z-10 glass p-10 rounded-[3rem] shadow-[0_32px_64px_rgba(0,0,0,0.15)] max-w-[360px] transition-all duration-500 ${darkMode ? 'glass-dark' : ''}`}
              >
                <div className="flex items-center gap-4 text-[#6A59CC] mb-6">
                  <div className="p-3 bg-[#6A59CC]/10 rounded-2xl">
                    <MapPin className="w-6 h-6" />
                  </div>
                  <h4 className="text-[10px] font-black uppercase tracking-[0.3em]">Active Station</h4>
                </div>
                <p className="text-4xl font-black mb-3 tracking-tighter leading-none">{selectedLocation}</p>
                <p className={`text-sm font-bold leading-relaxed ${darkMode ? 'text-white/60' : 'text-[#8E8E93]'}`}>{LOCATION_DETAILS[selectedLocation].address}</p>
                <div className="mt-8 pt-8 border-t border-black/5 dark:border-white/5 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">Signal</span>
                    <span className="text-sm font-black text-emerald-500">Excellent</span>
                  </div>
                  <div className="flex flex-col text-right">
                    <span className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93]">Uptime</span>
                    <span className="text-sm font-black">99.9%</span>
                  </div>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              initial={{ opacity: 0, x: 40 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ type: "spring", damping: 25, stiffness: 100 }}
              className="space-y-10"
            >
              <div className={`rounded-[4rem] p-12 border shadow-[0_32px_64px_rgba(0,0,0,0.05)] transition-colors duration-700 ${darkMode ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-[#D2D2D7]'}`}>
                <h3 className="font-black text-3xl mb-12 flex items-center gap-5 tracking-tighter">
                  <div className="p-4 bg-[#6A59CC]/10 rounded-[1.5rem]">
                    <Settings className="w-7 h-7 text-[#6A59CC]" />
                  </div>
                  Status
                </h3>
                
                <div className="space-y-12">
                  <StatusProgress label="GSM Signal" value="Strong" percent={85} color="bg-[#6A59CC]" darkMode={darkMode} />
                  <StatusProgress label="Dog Food Hopper" value="4.2kg / 5kg" percent={84} color="bg-[#4ECDC4]" darkMode={darkMode} />
                  <StatusProgress label="Cat Food Hopper" value="3.8kg / 5kg" percent={76} color="bg-[#FF6B6B]" darkMode={darkMode} />
                  <StatusProgress label="Battery Level" value="92%" percent={92} color="bg-emerald-500" darkMode={darkMode} />
                </div>
              </div>

              <motion.div 
                whileHover={{ scale: 1.02 }}
                className="bg-[#6A59CC] rounded-[4rem] p-12 text-white shadow-2xl shadow-[#6A59CC]/40 relative overflow-hidden group"
              >
                <div className="absolute top-0 right-0 p-12 opacity-10 group-hover:scale-110 transition-transform duration-700">
                  <RefreshCw className="w-40 h-40" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-3xl mb-4 tracking-tighter">Quick Test</h3>
                  <p className="text-white/80 text-base mb-12 leading-relaxed font-medium">Manually trigger the dispensing mechanism for testing purposes. Select type and amount.</p>
                  
                  <div className="space-y-10 mb-12">
                    <div className="flex gap-4 p-1.5 bg-white/10 rounded-[1.5rem]">
                      {(['Dog', 'Cat'] as const).map(type => (
                        <button 
                          key={type}
                          onClick={() => setSimulatedType(type)}
                          className={`flex-1 py-4 rounded-xl font-black text-[10px] uppercase tracking-widest transition-all ${simulatedType === type ? 'bg-white text-[#6A59CC] shadow-xl' : 'text-white/60 hover:text-white'}`}
                        >
                          {type}
                        </button>
                      ))}
                    </div>
                    
                    <div className="space-y-4">
                      <label className="text-[10px] font-black text-white/60 uppercase tracking-[0.3em] ml-6">Coin Amount (Pesos)</label>
                      <input 
                        type="number" 
                        id="sim-coins"
                        defaultValue="1" 
                        min="1" 
                        className="w-full bg-white/10 border border-white/20 rounded-[1.5rem] px-8 py-5 text-white outline-none focus:bg-white/20 transition-all font-black text-lg"
                      />
                    </div>
                  </div>

                  <motion.button 
                    whileHover={{ scale: 1.02, y: -2 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={simulateDispense}
                    disabled={isProcessing}
                    className="w-full bg-white text-[#6A59CC] py-6 rounded-[1.5rem] font-black text-sm transition-all flex items-center justify-center gap-4 shadow-2xl shadow-black/20 disabled:opacity-50"
                  >
                    {isProcessing ? <RefreshCw className="w-6 h-6 animate-spin" /> : <RefreshCw className="w-6 h-6" />}
                    <span>{isProcessing ? 'Processing...' : 'Simulate Dispense'}</span>
                  </motion.button>
                </div>
              </motion.div>
            </motion.div>
          </div>
        )}

        {/* Recent Activity Section */}
        <motion.div 
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`rounded-[4rem] border shadow-[0_32px_64px_rgba(0,0,0,0.05)] overflow-hidden transition-colors duration-700 ${darkMode ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-[#D2D2D7]'}`}
        >
          <div className={`p-12 border-b flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6 ${darkMode ? 'border-white/10' : 'border-[#D2D2D7]'}`}>
            <div className="flex items-center gap-5">
              <div className="p-4 bg-[#6A59CC]/10 rounded-[1.5rem]">
                <History className="text-[#6A59CC] w-7 h-7" />
              </div>
              <div>
                <h3 className="font-black text-3xl tracking-tighter leading-none mb-2">Feeding Activity</h3>
                <p className="text-xs font-bold text-[#8E8E93] uppercase tracking-widest">Live logs for {selectedLocation}</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className={`text-[10px] font-black uppercase tracking-widest px-6 py-3 rounded-full transition-colors ${darkMode ? 'bg-white/5 text-white/60' : 'bg-[#F5F5F7] text-[#8E8E93]'}`}>
                {filteredLogs.length} Sessions
              </span>
            </div>
          </div>
          
          <div className="p-8">
            <div className="space-y-4">
              <AnimatePresence mode="popLayout">
                {filteredLogs.length > 0 ? (
                  filteredLogs.sort((a,b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).map((log, idx) => (
                    <motion.div
                      key={log.id}
                      initial={{ opacity: 0, y: 20, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      transition={{ delay: idx * 0.05, type: "spring", damping: 25, stiffness: 200 }}
                      className={`p-6 rounded-[2rem] border flex flex-col sm:flex-row items-center justify-between gap-6 transition-all hover:shadow-xl ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10' : 'bg-white border-black/5 hover:shadow-lg shadow-black/5'}`}
                    >
                      <div className="flex items-center gap-6 w-full sm:w-auto">
                        <div className={`p-4 rounded-2xl shadow-lg ${log.type === 'Dog' ? 'bg-[#4ECDC4] text-white' : 'bg-[#FF6B6B] text-white'}`}>
                          {log.type === 'Dog' ? <Dog className="w-6 h-6" /> : <Cat className="w-6 h-6" />}
                        </div>
                        <div>
                          <p className="font-black text-lg tracking-tight leading-none mb-1">{log.type} Feeding</p>
                          <p className="text-xs font-bold text-[#8E8E93]">{new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-12 w-full sm:w-auto justify-between sm:justify-end">
                        <div className="text-center sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Dispensed</p>
                          <p className="font-black text-xl tracking-tighter">{log.grams}g</p>
                        </div>
                        <div className="text-center sm:text-right">
                          <p className="text-[10px] font-black uppercase tracking-widest text-[#8E8E93] mb-1">Revenue</p>
                          <p className="font-black text-xl tracking-tighter text-emerald-500">₱{log.coins.toFixed(2)}</p>
                        </div>
                        <div className={`hidden md:flex p-3 rounded-xl ${darkMode ? 'bg-white/10' : 'bg-black/5'}`}>
                          <ChevronRight className="w-5 h-5 opacity-30" />
                        </div>
                      </div>
                    </motion.div>
                  ))
                ) : (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="py-20 text-center"
                  >
                    <div className="w-24 h-24 bg-black/5 dark:bg-white/5 rounded-[2.5rem] flex items-center justify-center mx-auto mb-6">
                      <History className="w-10 h-10 text-[#8E8E93] opacity-20" />
                    </div>
                    <p className="text-[#8E8E93] font-bold">No feeding activity recorded yet.</p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </motion.div>
      </main>

      <footer className={`max-w-7xl mx-auto p-10 text-center text-[10px] font-black uppercase tracking-[0.3em] border-t transition-colors duration-500 ${darkMode ? 'text-white/20 border-white/10' : 'text-[#8E8E93] border-[#D2D2D7]'}`}>
        PawFeeds DASHBOARD © 2026 • ECE SMART FEEDING NETWORK • POWERED BY GSM SIM7600
      </footer>

      {/* Modals */}
      <AnimatePresence>
        {activeModal && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setActiveModal(null)}
              className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className={`w-full max-w-lg p-10 rounded-[3rem] shadow-2xl relative z-10 transition-colors duration-500 ${darkMode ? 'bg-[#1D1D1F] text-white' : 'bg-white text-[#1D1D1F]'}`}
            >
              <button 
                onClick={() => setActiveModal(null)}
                className={`absolute top-8 right-8 p-2 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10' : 'hover:bg-[#F5F5F7]'}`}
              >
                <X className="w-6 h-6" />
              </button>
              
              <div className="space-y-8">
                {activeModal === 'profile' && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[#6A59CC]">My Profile</h3>
                    <div className="space-y-6">
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-3">Full Name</label>
                        <input 
                          type="text" 
                          defaultValue={user.name} 
                          className={`w-full px-6 py-4 rounded-2xl border outline-none focus:ring-2 focus:ring-[#6A59CC] transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#F5F5F7] border-[#D2D2D7]'}`}
                        />
                      </div>
                      <div className="space-y-2">
                        <label className="text-[10px] font-bold text-[#8E8E93] uppercase tracking-widest ml-3">Bio</label>
                        <textarea 
                          className={`w-full px-6 py-4 rounded-2xl border outline-none h-32 resize-none focus:ring-2 focus:ring-[#6A59CC] transition-all ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#F5F5F7] border-[#D2D2D7]'}`}
                          defaultValue={user.bio}
                        />
                      </div>
                      <button 
                        onClick={() => setActiveModal(null)}
                        className="w-full py-5 bg-[#6A59CC] text-white rounded-2xl font-bold shadow-xl shadow-[#6A59CC]/20"
                      >
                        Save Changes
                      </button>
                    </div>
                  </div>
                )}

                {activeModal === 'report' && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[#6A59CC]">Revenue Report</h3>
                    <div className={`p-8 rounded-[2.5rem] border ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#F5F5F7] border-[#D2D2D7]'}`}>
                      <div className="text-center mb-8">
                        <p className="text-[10px] font-black text-[#8E8E93] uppercase tracking-widest mb-1">Daily Summary</p>
                        <p className="text-xl font-black">{new Date().toLocaleDateString()}</p>
                      </div>
                      <div className="space-y-5">
                        <div className="flex justify-between items-center">
                          <span className="text-[#8E8E93] font-bold">Location</span>
                          <span className="font-black">{selectedLocation}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-[#8E8E93] font-bold">Sessions</span>
                          <span className="font-black">{stats.count}</span>
                        </div>
                        <hr className={darkMode ? 'border-white/10' : 'border-[#D2D2D7]'} />
                        <div className="flex justify-between items-center pt-2">
                          <span className="text-xl font-black">Total Revenue</span>
                          <span className="text-2xl font-black text-[#6A59CC]">₱{stats.totalCoins.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>
                    <button 
                      onClick={() => window.print()}
                      className="w-full py-5 bg-[#4ECDC4] text-white rounded-2xl font-bold shadow-xl shadow-[#4ECDC4]/20"
                    >
                      Print Report
                    </button>
                  </div>
                )}

                {activeModal === 'history' && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[#6A59CC]">Login History</h3>
                    <div className="space-y-4 max-h-[400px] overflow-y-auto pr-2 scrollbar-hide">
                      {[1, 2, 3].map(i => (
                        <div key={i} className={`p-5 rounded-2xl border flex justify-between items-center ${darkMode ? 'bg-white/5 border-white/10' : 'bg-[#F5F5F7] border-[#D2D2D7]'}`}>
                          <div>
                            <p className="font-bold">{user.username}</p>
                            <p className="text-[10px] text-[#8E8E93] font-black uppercase tracking-widest">Admin Access</p>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold">{new Date().toLocaleDateString()}</p>
                            <p className="text-[10px] text-[#8E8E93] font-medium">{10 + i}:30 AM</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {activeModal === 'requests' && (
                  <div className="space-y-8">
                    <h3 className="text-3xl font-black text-[#6A59CC]">Admin Requests</h3>
                    <div className={`p-16 text-center border-2 border-dashed rounded-[2.5rem] ${darkMode ? 'border-white/10' : 'border-[#D2D2D7]'}`}>
                      <ShieldCheck className={`w-16 h-16 mx-auto mb-4 opacity-10 ${darkMode ? 'text-white' : 'text-black'}`} />
                      <p className="text-[#8E8E93] font-bold">No pending requests</p>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Gallery Modal */}
      <AnimatePresence>
        {isGalleryOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-6">
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsGalleryOpen(false)}
              className="absolute inset-0 bg-black/80 backdrop-blur-md"
            />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className={`w-full max-w-5xl rounded-[3rem] shadow-2xl relative z-10 overflow-hidden p-10 transition-colors duration-500 ${darkMode ? 'bg-[#1D1D1F]' : 'bg-white'}`}
            >
              <button 
                onClick={() => setIsGalleryOpen(false)}
                className={`absolute top-10 right-10 p-3 rounded-full transition-colors ${darkMode ? 'hover:bg-white/10 text-white' : 'hover:bg-[#F5F5F7] text-[#1D1D1F]'}`}
              >
                <X className="w-8 h-8" />
              </button>
              <div className="space-y-10">
                <div className="flex items-center gap-4">
                  <ImageIcon className="w-10 h-10 text-[#6A59CC]" />
                  <h3 className="text-4xl font-black tracking-tight">Community Gallery</h3>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 max-h-[60vh] overflow-y-auto pr-4 scrollbar-hide">
                  {GALLERY_IMAGES.map((img, i) => (
                    <motion.div 
                      key={i}
                      whileHover={{ scale: 1.05, rotate: i % 2 === 0 ? 2 : -2 }}
                      className="relative aspect-square rounded-[2rem] overflow-hidden shadow-xl"
                    >
                      <img src={img} className="w-full h-full object-cover" alt={`Gallery ${i}`} />
                    </motion.div>
                  ))}
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Notification Toast */}
      <AnimatePresence>
        {notification && (
          <motion.div 
            initial={{ opacity: 0, y: 50, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: 50, x: '-50%' }}
            className={`fixed bottom-10 left-1/2 z-[200] px-8 py-4 rounded-2xl font-bold shadow-2xl flex items-center gap-3 text-white ${notification.type === 'success' ? 'bg-emerald-500' : 'bg-rose-500'}`}
          >
            {notification.type === 'success' ? <Check className="w-5 h-5" /> : <X className="w-5 h-5" />}
            <span>{notification.msg}</span>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

// --- Sub-components ---

const MenuButton: React.FC<{ 
  icon: React.ReactNode; 
  label: string; 
  onClick: () => void; 
  danger?: boolean;
  darkMode: boolean;
}> = ({ icon, label, onClick, danger, darkMode }) => (
  <motion.button 
    whileHover={{ x: 4, backgroundColor: darkMode ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)' }}
    whileTap={{ scale: 0.98 }}
    onClick={onClick}
    className={`w-full flex items-center justify-between px-5 py-4 rounded-2xl transition-all font-bold text-sm ${danger ? 'text-rose-500 hover:bg-rose-500/10' : darkMode ? 'text-white/80' : 'text-[#1D1D1F]'}`}
  >
    <div className="flex items-center gap-4">
      <div className={`p-2 rounded-xl ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
        {icon}
      </div>
      {label}
    </div>
    <ChevronRight className="w-4 h-4 opacity-30" />
  </motion.button>
);

const QuickAction: React.FC<{
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  color: string;
  darkMode: boolean;
}> = ({ icon, label, onClick, color, darkMode }) => (
  <motion.button
    whileHover={{ y: -8, scale: 1.05 }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`flex flex-col items-center gap-5 p-10 rounded-[3.5rem] border transition-all duration-500 ${darkMode ? 'bg-white/5 border-white/10 hover:bg-white/10 shadow-white/5' : 'bg-white border-black/5 hover:shadow-[0_32px_64px_rgba(0,0,0,0.1)] shadow-black/5'}`}
  >
    <div className={`p-6 rounded-[2rem] shadow-2xl ${color}`}>
      {React.cloneElement(icon as React.ReactElement, { className: 'w-10 h-10' })}
    </div>
    <span className="text-[11px] font-black uppercase tracking-[0.3em] text-[#8E8E93]">{label}</span>
  </motion.button>
);

const StatCard: React.FC<{ 
  title: string; 
  value: string; 
  sub: string; 
  icon: React.ReactNode; 
  color: 'amber' | 'indigo' | 'teal' | 'rose';
  darkMode: boolean;
}> = ({ title, value, sub, icon, color, darkMode }) => {
  const colors = {
    amber: 'bg-amber-500/10 text-amber-500 border-amber-500/20 shadow-amber-500/5',
    indigo: 'bg-[#6A59CC]/10 text-[#6A59CC] border-[#6A59CC]/20 shadow-[#6A59CC]/5',
    teal: 'bg-[#4ECDC4]/10 text-[#4ECDC4] border-[#4ECDC4]/20 shadow-[#4ECDC4]/5',
    rose: 'bg-[#FF6B6B]/10 text-[#FF6B6B] border-[#FF6B6B]/20 shadow-[#FF6B6B]/5'
  };
  return (
    <motion.div 
      whileHover={{ y: -12, scale: 1.02 }}
      transition={{ type: "spring", damping: 25, stiffness: 200 }}
      className={`p-10 rounded-[4rem] border shadow-[0_32px_64px_rgba(0,0,0,0.05)] transition-all duration-700 relative overflow-hidden group ${darkMode ? 'bg-[#1D1D1F] border-white/10' : 'bg-white border-[#D2D2D7]'}`}
    >
      <div className="absolute top-0 right-0 p-12 opacity-5 group-hover:opacity-10 transition-opacity duration-700">
        {React.cloneElement(icon as React.ReactElement, { className: 'w-32 h-32 rotate-12' })}
      </div>
      <div className="flex justify-between items-start mb-10">
        <div className={`p-5 rounded-[1.75rem] shadow-2xl ${colors[color]}`}>
          {React.cloneElement(icon as React.ReactElement, { className: 'w-8 h-8' })}
        </div>
      </div>
      <h4 className="text-[#8E8E93] text-[11px] font-black uppercase tracking-[0.3em] mb-3">{title}</h4>
      <div className="text-6xl font-black mb-3 tracking-tighter leading-none">{value}</div>
      <div className="text-sm font-bold text-[#8E8E93]">{sub}</div>
    </motion.div>
  );
};

const StatusProgress: React.FC<{ 
  label: string; 
  value: string; 
  percent: number; 
  color: string;
  darkMode: boolean;
}> = ({ label, value, percent, color, darkMode }) => (
  <div className="space-y-3">
    <div className="flex justify-between items-end">
      <span className="text-xs font-bold text-[#8E8E93]">{label}</span>
      <span className="text-xs font-black">{value}</span>
    </div>
    <div className={`h-3 rounded-full overflow-hidden ${darkMode ? 'bg-white/5' : 'bg-black/5'}`}>
      <motion.div 
        initial={{ width: 0 }}
        whileInView={{ width: `${percent}%` }}
        transition={{ duration: 1, ease: "easeOut" }}
        className={`h-full ${color} shadow-lg`}
      />
    </div>
  </div>
);

export default App;
