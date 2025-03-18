/**
 * Dice component
 * Renders a single die with its value (1-6)
 * Handles selection/deselection of dice during gameplay
 * Visual representation changes based on state (selected, locked, etc.)
 */

import React from 'react';
import '../styles/dice.css';

const Dice = ({ value, selected, disabled, onClick }) => {
  // CSS classes for styling the die
  const diceClasses = [
    'die',
    selected ? 'selected' : '',
    disabled ? 'disabled' : ''
  ].filter(Boolean).join(' ');

  // Generates dots for the die face based on value (1-6)
  const renderDots = () => {
    const dots = [];
    
    // Different dot arrangements based on die value
    switch (value) {
      case 1:
        dots.push(<div key="center" className="dot center"></div>);
        break;
      case 2:
        dots.push(
          <div key="top-left" className="dot top-left"></div>,
          <div key="bottom-right" className="dot bottom-right"></div>
        );
        break;
      case 3:
        dots.push(
          <div key="top-left" className="dot top-left"></div>,
          <div key="center" className="dot center"></div>,
          <div key="bottom-right" className="dot bottom-right"></div>
        );
        break;
      case 4:
        dots.push(
          <div key="top-left" className="dot top-left"></div>,
          <div key="top-right" className="dot top-right"></div>,
          <div key="bottom-left" className="dot bottom-left"></div>,
          <div key="bottom-right" className="dot bottom-right"></div>
        );
        break;
      case 5:
        dots.push(
          <div key="top-left" className="dot top-left"></div>,
          <div key="top-right" className="dot top-right"></div>,
          <div key="center" className="dot center"></div>,
          <div key="bottom-left" className="dot bottom-left"></div>,
          <div key="bottom-right" className="dot bottom-right"></div>
        );
        break;
      case 6:
        dots.push(
          <div key="top-left" className="dot top-left"></div>,
          <div key="top-right" className="dot top-right"></div>,
          <div key="middle-left" className="dot middle-left"></div>,
          <div key="middle-right" className="dot middle-right"></div>,
          <div key="bottom-left" className="dot bottom-left"></div>,
          <div key="bottom-right" className="dot bottom-right"></div>
        );
        break;
      default:
        break;
    }
    
    return dots;
  };

  return (
    <div 
      className={diceClasses}
      onClick={disabled ? null : onClick}
    >
      {renderDots()}
    </div>
  );
};

export default Dice; 