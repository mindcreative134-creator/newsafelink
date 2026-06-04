import React from 'react';
import { useSafelink } from '../context/SafelinkContext';

export default function StepHeader() {
  const { currentStep } = useSafelink();
  if (!currentStep) return null;

  return (
    <div className="sticky top-[64px] z-30 w-full">
      <div className="w-full bg-red-600 text-white text-xs font-bold py-1.5 text-center tracking-wide">
        You are currently on step{' '}
        <span className="font-extrabold">{currentStep}/3</span>.
      </div>
    </div>
  );
}
