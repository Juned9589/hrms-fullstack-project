import React from 'react';
import { Inbox } from 'lucide-react';

export default function EmptyState({ icon: Icon = Inbox, title, description, action }) {
  return (
    <div className="flex flex-col items-center justify-center text-center p-8 max-w-sm mx-auto animate-fadeInUp">
      <div className="p-6 glass-shell text-[#8A6514] rounded-2xl mb-4">
        <Icon className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-semibold tracking-tight text-slate-950 mb-1">{title}</h3>
      <p className="text-sm text-slate-500 leading-relaxed mb-6">{description}</p>
      {action && <div className="w-full flex justify-center">{action}</div>}
    </div>
  );
}
