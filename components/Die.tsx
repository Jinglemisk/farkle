
import React, { useMemo } from 'react';
import { DieValue } from '../types';

interface DieProps {
  value: DieValue;
  isSelected: boolean;
  isKept: boolean;
  onClick: () => void;
  isScoring?: boolean;
  showPlaceholder?: boolean;
  size?: 'base' | 'sm';
}

type DotPosition = 'top-left' | 'top-right' | 'mid-left' | 'mid-right' | 'bottom-left' | 'bottom-right' | 'center';

const Dot: React.FC<{ position: DotPosition; size: 'base' | 'sm' }> = ({ position, size }) => {
    const basePositions: Record<DotPosition, string> = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'mid-left': 'top-1/2 left-2 -translate-y-1/2',
        'mid-right': 'top-1/2 right-2 -translate-y-1/2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    const smallPositions: Record<DotPosition, string> = {
        'top-left': 'top-1 left-1',
        'top-right': 'top-1 right-1',
        'mid-left': 'top-1/2 left-1 -translate-y-1/2',
        'mid-right': 'top-1/2 right-1 -translate-y-1/2',
        'bottom-left': 'bottom-1 left-1',
        'bottom-right': 'bottom-1 right-1',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    const positionClasses = size === 'sm' ? smallPositions[position] : basePositions[position];
    const sizeClasses = size === 'sm' ? 'w-1.5 h-1.5 md:w-2.5 md:h-2.5' : 'w-2.5 h-2.5 md:w-3.5 md:h-3.5';

    return <div className={`absolute ${sizeClasses} bg-stone-800 rounded-full ${positionClasses}`}></div>;
};

const DieFace: React.FC<{ value: DieValue; showPlaceholder?: boolean; size: 'base' | 'sm' }> = ({ value, showPlaceholder, size }) => {
    const patterns: { [key in DieValue]: DotPosition[] } = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
    };

    if (showPlaceholder) {
        return (
            <div className={`relative w-full h-full ${size === 'sm' ? 'p-1' : 'p-2'} flex items-center justify-center`}>
                <span className={`font-bold text-stone-800 ${size === 'sm' ? 'text-xl' : 'text-4xl md:text-5xl'}`}>?</span>
            </div>
        );
    }

    return (
        <div className={`relative w-full h-full ${size === 'sm' ? 'p-1' : 'p-2'}`}>
            {patterns[value].map(pos => <Dot key={pos} position={pos} size={size} />)}
        </div>
    );
};


const Die: React.FC<DieProps> = ({ value, isSelected, isKept, onClick, isScoring = true, showPlaceholder = false, size = 'base' }) => {
    const baseClasses = size === 'sm'
        ? "w-8 h-8 bg-amber-50 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center"
        : "w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center";

    const stateClasses = useMemo(() => {
        if (isKept) {
            return "border-4 border-lime-600 opacity-80 scale-90";
        }
        if (isSelected) {
            return "border-4 border-amber-400 transform -translate-y-2 scale-105 shadow-xl";
        }
        // Only show hover/cursor styles if die is scoring
        if (isScoring) {
            return "border-2 border-amber-800 cursor-pointer hover:border-amber-400 hover:scale-105";
        }
        return "border-2 border-amber-800 opacity-50";
    }, [isSelected, isKept, isScoring]);


    return (
        <div className={`${baseClasses} ${stateClasses}`} onClick={onClick}>
            <DieFace value={value} showPlaceholder={showPlaceholder} size={size} />
        </div>
    );
};

export default Die;
