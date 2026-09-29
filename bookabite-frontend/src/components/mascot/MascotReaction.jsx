import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { HiX, HiSparkles, HiOutlineChevronDown, HiOutlineChevronUp } from 'react-icons/hi';
import FoodMascot from './FoodMascot';
import { useMascot } from '../../context/MascotContext';
import './MascotReaction.css';

export default function MascotReaction() {
  const { mood, message, isOpen, toggleOpen, triggerReaction } = useMascot();

  const handleMascotClick = () => {
    if (!isOpen) {
      toggleOpen();
      return;
    }
    const funTips = [
      { mood: 'happy', msg: "Looking for pure veg? We have handpicked garden kitchens on FC Road!" },
      { mood: 'excited', msg: "Try our top rated Smoked Butter Chicken at The Spice Terrace!" },
      { mood: 'serving', msg: "Would you like me to recommend the best rooftop tables for tonight?" },
      { mood: 'thinking', msg: "Booking for a birthday? Remember to add a special request during checkout!" },
    ];
    const pick = funTips[Math.floor(Math.random() * funTips.length)];
    triggerReaction(pick.mood, pick.msg, 5000);
  };

  return (
    <div className="bab-mascot-widget" aria-label="BookABite Mascot Assistant">
      <AnimatePresence>
        {isOpen && message && (
          <motion.div
            className="bab-mascot-bubble"
            initial={{ opacity: 0, y: 15, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            transition={{ duration: 0.25 }}
          >
            <div className="bab-mascot-bubble__header">
              <span className="bab-mascot-bubble__name">
                <HiSparkles size={12} color="#D65A3A" /> Chef Pierre
              </span>
              <button
                type="button"
                className="bab-mascot-bubble__close"
                onClick={toggleOpen}
                aria-label="Minimize mascot"
              >
                <HiOutlineChevronDown size={14} />
              </button>
            </div>
            <p className="bab-mascot-bubble__text">{message}</p>
          </motion.div>
        )}
      </AnimatePresence>

      <button
        type="button"
        className={`bab-mascot-trigger ${!isOpen ? 'bab-mascot-trigger--minimized' : ''}`}
        onClick={handleMascotClick}
        title={isOpen ? "Click Pierre for tips!" : "Open Pierre assistant"}
        aria-label="BookABite mascot"
      >
        <FoodMascot mood={mood} size={isOpen ? 84 : 52} />
        {!isOpen && (
          <span className="bab-mascot-badge" title="Chef Pierre ready to help">
            ✦
          </span>
        )}
      </button>
    </div>
  );
}
