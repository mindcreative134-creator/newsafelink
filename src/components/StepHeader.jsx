import React from 'react';
import { useSafelink } from '../context/SafelinkContext';

export default function StepHeader() {
  const { currentStep } = useSafelink();
  if (!currentStep) return null;

  return (
    <div className="sticky top-0 z-50 w-full h-8 flex items-center justify-center bg-red-600 text-white text-xs font-bold tracking-wide">
      You are currently on step{' '}
      <span className="font-extrabold ml-1">{currentStep}/3</span>.
    </div>
  );
}
