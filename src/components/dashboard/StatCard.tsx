import { Paper, Group, Text, ThemeIcon, rem } from '@mantine/core';
import type { StatCardProps } from '../../types/dashboard.types';

export const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  description, 
  valueColor, 
  icon 
}) => (
  <Paper withBorder p="md" radius="md" shadow="sm" style={{ height: '100%' }}>
    <Group justify="space-between" align="flex-start" mb="xs">
      <div style={{ flex: 1 }}>
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
          {title}
        </Text>
        <Text 
          fz={rem(32)}
          fw={900} 
          c={valueColor || 'var(--mantine-color-default)'}
          style={{ lineHeight: 1 }}
          mt={4}
        >
          {value}
        </Text>
        <Text fz="sm" c="dimmed" mt={2}>
          {description}
        </Text>
      </div>
      {icon && (
        <ThemeIcon variant="light" size="lg" color="blue">
          {icon}
        </ThemeIcon>
      )}
    </Group>
  </Paper>
);