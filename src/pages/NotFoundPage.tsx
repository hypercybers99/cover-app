import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';

export const NotFoundPage: React.FC = () => {
  return (
    <div className="max-w-md mx-auto px-4 py-20 flex flex-col items-center gap-6 text-center">
      <div className="w-16 h-16 rounded-lg bg-brick-bg text-brick flex items-center justify-center">
        <ShieldAlert className="w-10 h-10" />
      </div>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold text-ink">Page Not Found</h1>
        <p className="text-ink-muted">
          The requested page does not exist or has moved.
        </p>
      </div>
      <Link
        to="/"
        className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-primary text-white font-semibold hover:bg-primary-hover min-h-[48px]"
      >
        <ArrowLeft className="w-4 h-4" />
        <span>Return to Home</span>
      </Link>
    </div>
  );
};
