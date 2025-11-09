// Keypad.tsx

import { useState } from 'react';
import { Paper, Title, Button, Stack, Text, Group, rem } from '@mantine/core'; 

// Definición de la interfaz de Props
interface KeypadProps {
    onPinSubmit: (pin: string) => void;
    message: string;
    pinLength: number;
}

// Aplicación de la interfaz KeypadProps
export default function Keypad({ onPinSubmit, message, pinLength }: KeypadProps) {
    const [input, setInput] = useState('');

    const handleButtonClick = (value: string) => {
        if (value === 'DEL') {
            setInput((current) => current.slice(0, -1));
        } else if (value === 'OK') {
            if (input.length === pinLength) {
                onPinSubmit(input);
                setInput('');
            }
        } else if (input.length < pinLength) {
            setInput((current) => current + value);
        }
    };

    const buttons = [
        ['1', '2', '3'],
        ['4', '5', '6'],
        ['7', '8', '9'],
        ['DEL', '0', 'OK'],
    ];
    
    // Muestra puntos o asteriscos en lugar del PIN para seguridad
    const displayInput = '•'.repeat(input.length);
    const remainingDots = pinLength - input.length;
    const placeholder = '_'.repeat(remainingDots);

    return (
        <Paper 
            shadow="xl" 
            p="xl" 
            style={{ 
                width: rem(360), 
                textAlign: 'center',
                backgroundColor: '#2D2D2D', 
            }} 
        >
            <Title order={3} mb="xs" style={{ color: 'white' }}>Bloqueo de TPV</Title>
            <Text mb="md" style={{ color: '#a0aec0' }}>{message}</Text>

            {/* Display del PIN */}
            <Paper 
                withBorder 
                mb="md" 
                p="md" 
                style={{ 
                    fontSize: rem(32), 
                    letterSpacing: rem(10), 
                    fontFamily: 'monospace',
                    backgroundColor: '#1a202c',
                    color: 'white',
                    borderColor: '#4a5568',
                    minHeight: rem(60),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}
            >
                {displayInput}{placeholder}
            </Paper>

            {/* Teclado numérico */}
            <Stack gap="xs">
                {buttons.map((row, index) => (
                    <Group key={index} grow gap="xs">
                        {row.map((btn) => (
                            <Button
                                key={btn}
                                variant={btn === 'OK' && input.length === pinLength ? 'filled' : 'light'}
                                color={btn === 'DEL' ? 'red' : btn === 'OK' ? 'green' : 'gray'}
                                size="lg"
                                onClick={() => handleButtonClick(btn)}
                                disabled={btn === 'OK' && input.length !== pinLength}
                                style={{ 
                                    fontSize: btn === 'DEL' || btn === 'OK' ? rem(14) : rem(20),
                                    fontWeight: 600,
                                    minHeight: rem(60),
                                    padding: '0 8px',
                                    whiteSpace: 'nowrap',
                                    overflow: 'hidden',
                                }}
                            >
                                {btn}
                            </Button>
                        ))}
                    </Group>
                ))}
            </Stack>
        </Paper>
    );
}