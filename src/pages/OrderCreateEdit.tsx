// src/pages/OrderCreateEdit.tsx
import { useParams, useLocation } from 'react-router-dom';
import OrderForm from '../components/orders/OrderForm';
import type { Pedido } from '../types/orders.types';

export default function OrderCreateEdit() {
  const params = useParams();
  const location = useLocation();
  const pedidoExistente = location.state?.pedidoExistente as Pedido | undefined;
  
  const pedidoId = params.id ? parseInt(params.id) : undefined;

  return <OrderForm pedidoId={pedidoId} pedidoExistente={pedidoExistente} />;
}