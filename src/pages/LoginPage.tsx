// LoginPage.tsx
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../context/AuthContext'; 
import {
  TextInput,
  PasswordInput,
  Checkbox,
  Button,
  Paper,
  Title,
  Text,
  Container,
  Group,
  Stack,
  Alert,
} from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function LoginPage() {
  const [identifier, setIdentifier] = useState(''); // Estado 'identifier'
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  

  const navigate = useNavigate();
  const { login } = useAuth(); 

  const handleSubmit = async () => {
    setError('');
    setLoading(true);

    const success = await login(identifier, password);

    if (success) {
      navigate('/dashboard', { replace: true });
    } else {
      // Pista de error actualizada con los ejemplos de usuario/email
      setError('Credenciales incorrectas. (Pista: propietaria@papeleria.com, ana_super, admin@papeleria.com, juan_admin, o luis_emp / Contraseña: 1234)');
    }

    setLoading(false);
  };

  return (
    <Container size={420} my={40}>
      <Title ta="center" fw={900} style={{ fontFamily: 'Greycliff CF, sans-serif' }}>
        Iniciar sesión
      </Title>

      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <Stack>
          {error && (
            <Alert icon={<IconAlertCircle size="1rem" />} title="Error de autenticación" color="red" variant="light">
              {error}
            </Alert>
          )}

          <TextInput
            label="Usuario / Email"
            placeholder="Tu@email.com o Nombre de Usuario"
            required
            value={identifier}
            onChange={(e) => setIdentifier(e.target.value)}
            type="text" 
          />

          <PasswordInput
            label="Contraseña"
            placeholder="Tu contraseña"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          {/*<Group justify="flex-end">
            <Checkbox
              label="Recordarme"
              checked={rememberMe}
              onChange={(e) => setRememberMe(e.currentTarget.checked)}
            />        
          </Group>*/}

          <Button onClick={handleSubmit} fullWidth mt="xl" loading={loading}>
            Iniciar sesión
          </Button>
        </Stack>
      </Paper>
    </Container>
  );
}