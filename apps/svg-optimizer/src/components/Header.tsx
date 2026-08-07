import React from 'react';
import { Header as SharedHeader } from '@repo/ui';
import { Sparkles } from 'lucide-react';

export const Header: React.FC = () => {
  return (
    <SharedHeader
      title=".svg Optimizer"
      icon={<Sparkles className="w-4 h-4 text-white" />}
      showPrivacyBadge={true}
      privacyBadgeText="Private"
    />
  );
};
