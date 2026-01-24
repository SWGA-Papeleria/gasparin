// src/pages/PointOfSale.tsx
import React from 'react';
import { Container, Paper, Stack, Text, Button, Grid, Group, ActionIcon, Tooltip } from '@mantine/core';
import { IconDoorExit } from '@tabler/icons-react';

// Components
import ProductList from '../components/point-of-sale/ProductList';
import Cart from '../components/point-of-sale/Cart';
import PaymentModal from '../components/point-of-sale/PaymentModal';
import { ConfirmationScreen } from '../components/point-of-sale/ConfirmationScreen';
import AmountModal from '../components/point-of-sale/AmountModal';

// Hooks
import { usePOS } from '../hooks/usePOS';

const PointOfSale: React.FC = () => {
  const {
    // Estados
    isSaleActive,
    currentSaleId,
    saleItems,
    checkoutStage,
    payments,
    changeDue,
    searchTerm,
    filteredProducts,
    saleTotal,
    isInitialModalOpen,
    isClosingModalOpen,
    isSearching,
    
    // Setters
    setSearchTerm,
    setIsInitialModalOpen,
    setIsClosingModalOpen,
    
    // Funciones
    startNewSale,
    handleInitialAmountSubmit,
    endSaleSession,
    handleClosingAmountSubmit,
    addItemToSale, // ← CORRECTO: Esta es la función del hook
    updateItemQuantity,
    removeItem,
    handleStartPayment,
    handlePaymentComplete,
    handleNewOrder,
    handleSearchProducts,
  } = usePOS();

  // 1. VISTA INICIAL (Pantalla de "Iniciar caja")
  if (!isSaleActive) {
    return (
      <Container size="xl">
        {/* CABECERA INLINE */}
        <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between">
            <div>
              <h3>Punto de Venta (POS)</h3>
              <Text c="dimmed" size="sm">Terminal de venta para registro de transacciones</Text>
            </div>
          </Group>
        </Paper>

        <Paper withBorder p="xl" shadow="sm">
          <Group justify="space-between" align="flex-start">
            <Stack>
              <Text size="lg" fw={700}>Terminal de Venta</Text>
              <Text c="dimmed">
                Presiona "Iniciar Sesión de Venta" para comenzar a registrar ventas.
              </Text>
            </Stack>
            
            <Button onClick={startNewSale} size="md">
              Iniciar Sesión de Venta
            </Button>
          </Group>
        </Paper>

        <AmountModal
          opened={isInitialModalOpen}
          onClose={() => setIsInitialModalOpen(false)}
          onSubmit={handleInitialAmountSubmit}
          title="Apertura de caja"
          actionLabel="Confirmar Apertura"
        />
      </Container>
    );
  }
  
  // 2. PANTALLA DE CONFIRMACIÓN
  if (checkoutStage === 'confirmation' && currentSaleId !== null) {
    return (
      <ConfirmationScreen 
        saleId={currentSaleId}
        saleItems={saleItems}
        payments={payments}
        changeDue={changeDue}
        totalAmount={saleTotal}
        onNewOrder={handleNewOrder}
      />
    );
  }

  // 3. VISTA DE TPV ACTIVO
  return (
    <Container size="xl">
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        {/* CABECERA INLINE */}
        <Paper withBorder p="md" mb="md" shadow="xs" style={{ flexShrink: 0 }}>
          <Group justify="space-between">
            <h3>Sesión de Venta Activa #{currentSaleId}</h3>
            <Group gap="xs">
              <Tooltip label="Finalizar Sesión de Venta" position="bottom" withArrow>
                <ActionIcon 
                  size="lg" 
                  variant="filled" 
                  color="red" 
                  onClick={endSaleSession}
                >
                  <IconDoorExit size="1.2rem" />
                </ActionIcon>
              </Tooltip>
            </Group>
          </Group>
        </Paper>

        <Grid gutter="md" style={{ flex: 1, overflow: 'hidden', minHeight: 0 }}>
          <Grid.Col span={8}>
            <ProductList
              products={filteredProducts}
              searchTerm={searchTerm}
              onSearchChange={setSearchTerm}
              onSearchSubmit={handleSearchProducts}
              onAddToCart={addItemToSale} // ← AQUÍ CORREGIDO: addItemToSale en lugar de addItemToCart
              isSearching={isSearching}
            />
          </Grid.Col>

          <Grid.Col span={4}>
            <Cart
              items={saleItems}
              total={saleTotal}
              onUpdateQuantity={updateItemQuantity}
              onRemoveItem={removeItem}
              onStartPayment={handleStartPayment}
            />
          </Grid.Col>
        </Grid>
        
        <AmountModal
          opened={isClosingModalOpen}
          onClose={() => setIsClosingModalOpen(false)}
          onSubmit={handleClosingAmountSubmit}
          title="Cierre de caja"
          actionLabel="Cerrar caja"
        />
        
        <PaymentModal
          opened={checkoutStage === 'payment'}
          onClose={() => handleNewOrder()}
          totalAmount={saleTotal}
          onPaymentComplete={handlePaymentComplete}
        />
      </div>
    </Container>
  );
};

export default PointOfSale;