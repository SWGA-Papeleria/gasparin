// src/components/LabelWithTooltip.tsx
import { Tooltip } from '@mantine/core';
import { IconHelp } from '@tabler/icons-react';

interface LabelWithTooltipProps {
  label: string;
  tooltip: string;
}

export const LabelWithTooltip = ({ label, tooltip }: LabelWithTooltipProps) => (
  <div style={{ 
    display: 'inline-flex', 
    alignItems: 'center', 
    gap: '5px' 
  }}>
    <span style={{ display: 'flex', alignItems: 'center' }}>{label}</span>
    <Tooltip label={tooltip} withArrow>
      <span style={{ 
        cursor: 'help', 
        color: '#228be6',
        display: 'flex',
        alignItems: 'center'
      }}>
        <IconHelp size="1rem" />
      </span>
    </Tooltip>
  </div>
);

export default LabelWithTooltip;