
import React, { useMemo } from 'react';
import { DieValue } from '../types';

interface DieProps {
  value: DieValue;
  isSelected: boolean;
  isKept: boolean;
  onClick: () => void;
  isScoring?: boolean;
}

const Dot: React.FC<{ position: string }> = ({ position }) => (
    <div className={`absolute w-3 h-3 md:w-4 md:h-4 bg-stone-800 rounded-full ${position}`}></div>
);

const DieFace: React.FC<{ value: DieValue }> = ({ value }) => {
    const patterns: { [key in DieValue]: string[] } = {
        1: ['center'],
        2: ['top-left', 'bottom-right'],
        3: ['top-left', 'center', 'bottom-right'],
        4: ['top-left', 'top-right', 'bottom-left', 'bottom-right'],
        5: ['top-left', 'top-right', 'center', 'bottom-left', 'bottom-right'],
        6: ['top-left', 'top-right', 'mid-left', 'mid-right', 'bottom-left', 'bottom-right'],
    };

    const dotPositions: { [key: string]: string } = {
        'top-left': 'top-2 left-2',
        'top-right': 'top-2 right-2',
        'mid-left': 'top-1/2 left-2 -translate-y-1/2',
        'mid-right': 'top-1/2 right-2 -translate-y-1/2',
        'bottom-left': 'bottom-2 left-2',
        'bottom-right': 'bottom-2 right-2',
        'center': 'top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2',
    };

    return (
        <div className="relative w-full h-full p-2">
            {patterns[value].map(pos => <Dot key={pos} position={dotPositions[pos]} />)}
        </div>
    );
};


const Die: React.FC<DieProps> = ({ value, isSelected, isKept, onClick, isScoring = true }) => {
    const baseClasses = "w-16 h-16 md:w-20 md:h-20 bg-amber-50 rounded-lg shadow-md transition-all duration-200 flex items-center justify-center";

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
            <DieFace value={value} />
        </div>
    );
};

export default Die;
