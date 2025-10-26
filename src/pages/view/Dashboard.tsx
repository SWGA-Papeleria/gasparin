import { Title, Text, SimpleGrid, Paper, rem } from '@mantine/core';
import React from 'react';

// Interfaz para definir las propiedades de cada tarjeta de estadística
interface StatCardProps {
    title: string;
    value: string;
    description: string;
    valueColor?: string;
}

// Componente para renderizar una tarjeta de estadística reutilizable
const StatCard: React.FC<StatCardProps> = ({ title, value, description, valueColor }) => (
    <Paper withBorder p="xl" radius="md" shadow="sm">
        <Text fz="xs" tt="uppercase" fw={700} c="dimmed">
            {title}
        </Text>
        <Text 
            fz={rem(48)}
            fw={900} 
            c={valueColor || 'var(--mantine-color-default)'}
            style={{ lineHeight: 1 }}
        >
            {value}
        </Text>
        <Text fz="sm" c="dimmed">
            {description}
        </Text>
    </Paper>
);


export default function Dashboard() {
    return (
        <>
            <Title order={1} mb="md">
                Página Principal
            </Title>
            
            {/* SimpleGrid para organizar las 4 tarjetas en una cuadrícula adaptable */}
            <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
                <StatCard 
                    title="Ventas del Día (Hoy)" 
                    value="$ 1,540.50" 
                    description="+5% respecto a ayer" 
                    valueColor="green"
                />
                
                <StatCard 
                    title="Productos en Bajo Stock" 
                    value="12" 
                    description="Requieren atención inmediata" 
                    valueColor="red"
                />
                
                <StatCard 
                    title="Pedidos Urgentes" 
                    value="3" 
                    description="Para entrega esta semana"
                />
                
                <StatCard 
                    title="Proveedores Registrados" 
                    value="16" 
                    description="Último proveedor: Juan Pérez"
                />
            </SimpleGrid>

            <Title order={3} mt="xl" mb="md">
                Actividad Reciente
            </Title>
            <Text c="dimmed">
                Actividades recientes del sistema.
            </Text>
        </>
    );
}
