import { Text, Container, Button, Card, Group } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import { useAuthContext } from '../context/AuthContext';

export default function NotFound() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuthContext();

  // Determinar a dónde redirigir
  const handleGoBack = () => {
    if (isAuthenticated) {
      navigate('/dashboard'); // Si está autenticado, va al dashboard
    } else {
      navigate('/login'); // Si no está autenticado, va al login
    }
  };

  // Texto del botón según autenticación
  const buttonText = isAuthenticated ? 'Ir a la página principal' : 'Ir al Login';

  return (
    <Container size="sm" py="xl">
      <Card shadow="md" padding="xl" radius="md" withBorder>
        <Group justify="center" mb="lg">
          <Text size="72px" fw={900} c="gray.4">
            404
          </Text>
        </Group>

        <Text ta="center" size="xl" fw={700} mb="sm">
          Página no encontrada
        </Text>

        <Text ta="center" c="dimmed" mb="xl">
          La página que estás buscando no existe o ha sido movida.
        </Text>

        <Group justify="center">
          <Button
            onClick={handleGoBack}
            size="md"
            variant="filled"
          >
            {buttonText}
          </Button>
        </Group>
      </Card>
    </Container>
  );
}