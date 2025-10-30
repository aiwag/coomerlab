// src/routes/index.tsx
import { createFileRoute } from '@tanstack/react-router'
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion'
import { Link } from '@tanstack/react-router'
import { useTranslation } from 'react-i18next'
import InitialIcons from '@/components/template/InitialIcons'
import AgeVerification from '@/components/AgeVerification'
import { 
  Camera, Video, Image, Users, Play, Download, Heart, 
  Activity, Settings, ChevronRight, ArrowRight, Info, AlertTriangle
} from 'lucide-react'

export const Route = createFileRoute('/')({
  component: RouteComponent,
})

function RouteComponent() {
  const { t } = useTranslation()
  const [isVerified, setIsVerified] = useState<boolean | null>(null);

  // Check if user is already verified
  useEffect(() => {
    const storedData = localStorage.getItem('ageVerification');
    if (storedData) {
      try {
        const verificationData = JSON.parse(storedData);
        // Verification is valid for 30 days
        const isValid = Date.now() - verificationData.timestamp < 30 * 24 * 60 * 60 * 1000;
        setIsVerified(verificationData.isVerified && isValid);
      } catch (error) {
        console.error('Error parsing verification data:', error);
        setIsVerified(false);
      }
    } else {
      setIsVerified(false);
    }
  }, []);

  const features = [
    {
      to: "/camviewer",
      icon: <Camera size={20} />,
      title: "Cam Viewer",
      description: "Multi-stream viewer",
      color: "from-purple-600/20 to-pink-600/20",
      iconBg: "from-purple-600 to-pink-600",
      borderColor: "border-purple-500/30"
    },
    {
      to: "/redgifs",
      icon: <Video size={20} />,
      title: "RedGifs",
      description: "Adult content",
      color: "from-red-600/20 to-orange-600/20",
      iconBg: "from-red-600 to-orange-600",
      borderColor: "border-red-500/30"
    },
    {
      to: "/wallheaven",
      icon: <Image size={20} />,
      title: "Wallheaven",
      description: "High-quality wallpapers",
      color: "from-blue-600/20 to-cyan-600/20",
      iconBg: "from-blue-600 to-cyan-600",
      borderColor: "border-blue-500/30"
    },
    {
      to: "/coomerKemono",
      icon: <Users size={20} />,
      title: "CoomerKemono",
      description: "Artist collections",
      color: "from-green-600/20 to-teal-600/20",
      iconBg: "from-green-600 to-teal-600",
      borderColor: "border-green-500/30"
    }
  ]

  const quickActions = [
    { to: "/downloads", icon: <Download size={18} />, title: "Downloads" },
    { to: "/favorites", icon: <Heart size={18} />, title: "Favorites" },
    { to: "/activity", icon: <Activity size={18} />, title: "Activity" },
    { to: "/settings", icon: <Settings size={18} />, title: "Settings" }
  ]

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
        delayChildren: 0.1,
      }
    }
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 24
      }
    }
  }

  // Show age verification if not verified
  if (isVerified === false) {
    return <AgeVerification onVerified={() => setIsVerified(true)} />;
  }

  // Show loading state while checking verification
  if (isVerified === null) {
    return (
      <div className="min-h-screen bg-gray-900 text-white flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-gray-700 border-t-purple-500 rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-400">Verifying age...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white overflow-y-auto">
      {/* Subtle background elements */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-0 w-64 h-64 bg-purple-600 rounded-full filter blur-3xl opacity-5"></div>
        <div className="absolute bottom-0 right-0 w-64 h-64 bg-blue-600 rounded-full filter blur-3xl opacity-5"></div>
      </div>

      <motion.div 
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="relative z-10 max-w-4xl mx-auto px-4 py-8"
      >
        {/* Elegant Header */}
        <motion.div 
          variants={itemVariants}
          className="text-center mb-12"
        >
          <div className="flex items-center justify-center mb-4">
            <motion.div
              whileHover={{ rotate: 5 }}
              transition={{ type: "spring", stiffness: 300 }}
            >
              <InitialIcons />
            </motion.div>
          </div>
          <h1 className="text-4xl font-light tracking-wide mb-2">
            <span className="font-medium bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Coomer</span>
            <span className="font-medium bg-gradient-to-r from-gray-300 to-white bg-clip-text text-transparent">Labs</span>
          </h1>
          <p className="text-gray-400 text-sm">Your content management platform</p>
        </motion.div>

     

        {/* Main Features Grid */}
        <motion.div 
          variants={itemVariants}
          className="mb-10"
        >
          <h2 className="text-xl font-light mb-6 text-center">Explore Features</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {features.map((feature, index) => (
              <Link key={feature.to} to={feature.to}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -5 }}
                  className="group relative bg-gray-800/50 backdrop-blur-sm border border-gray-700/50 rounded-xl p-6 hover:border-gray-600/50 transition-all duration-300"
                >
                  {/* Subtle gradient overlay */}
                  <div className={`absolute inset-0 bg-gradient-to-br ${feature.color} rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500`}></div>
                  
                  <div className="relative z-10">
                    <div className={`w-14 h-14 rounded-xl bg-gradient-to-br ${feature.iconBg} flex items-center justify-center mb-4 shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:scale-105`}>
                      {feature.icon}
                    </div>
                    
                    <h3 className="text-lg font-medium mb-1">{feature.title}</h3>
                    <p className="text-gray-400 text-sm mb-4">{feature.description}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className={`h-px flex-1 bg-gradient-to-r ${feature.borderColor} mr-3`}></div>
                      <ChevronRight size={18} className="text-gray-500 group-hover:text-white transition-colors" />
                    </div>
                  </div>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Quick Actions */}
        <motion.div 
          variants={itemVariants}
          className="mb-10"
        >
          <h2 className="text-xl font-light mb-6 text-center">Quick Actions</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {quickActions.map((action, index) => (
              <Link key={action.to} to={action.to}>
                <motion.div
                  variants={itemVariants}
                  whileHover={{ y: -3 }}
                  className="group bg-gray-800/30 backdrop-blur-sm border border-gray-700/30 rounded-lg p-4 hover:border-gray-600/30 transition-all duration-300 flex flex-col items-center justify-center text-center"
                >
                  <div className="w-12 h-12 rounded-lg bg-gray-700/50 flex items-center justify-center mb-3 group-hover:bg-gray-700/70 transition-colors duration-300">
                    {action.icon}
                  </div>
                  <span className="text-sm font-medium">{action.title}</span>
                </motion.div>
              </Link>
            ))}
          </div>
        </motion.div>

        {/* Elegant Get Started Section */}
        <motion.div 
          variants={itemVariants}
          className="text-center"
        >
          <Link to="/camviewer">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="group relative px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full font-medium flex items-center justify-center gap-2 shadow-lg overflow-hidden"
            >
              {/* Shimmer effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000"></div>
              
              <Play size={18} />
              <span>Get Started</span>
              
              {/* Icon glow effect */}
              <motion.div
                className="absolute -inset-1 bg-gradient-to-r from-purple-600 to-pink-600 rounded-full blur-md opacity-0 group-hover:opacity-30 transition-opacity duration-300"
              ></motion.div>
            </motion.button>
          </Link>
          
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="flex items-center justify-center mt-6 text-gray-500 text-sm"
          >
            <span className="text-green-400 mr-2">✓</span>
            <span>Age verified - Premium content management experience</span>
          </motion.div>
        </motion.div>
      </motion.div>
    </div>
  )
}