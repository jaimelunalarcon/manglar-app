import { describe, it, expect, beforeEach, vi } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Usuarios from './Usuarios';

// Mock de localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
};
global.localStorage = localStorageMock;

describe('Componente Usuarios', () => {
  beforeEach(() => {
    // Limpiar mocks antes de cada test
    localStorageMock.getItem.mockClear();
    localStorageMock.setItem.mockClear();
    localStorageMock.removeItem.mockClear();
    
    // Simular localStorage vacío
    localStorageMock.getItem.mockReturnValue(null);
  });

  // ===== TESTS DE RENDERIZADO =====
  
  it('debe renderizar el componente correctamente', () => {
    render(<Usuarios />);
    
    expect(screen.getByText('Usuarios')).toBeInTheDocument();
    expect(screen.getByText('+ Nuevo Usuario')).toBeInTheDocument();
    expect(screen.getByText('No hay usuarios registrados')).toBeInTheDocument();
  });

  it('debe mostrar las columnas de la tabla', () => {
    render(<Usuarios />);
    
    expect(screen.getByText('RUT')).toBeInTheDocument();
    expect(screen.getByText('Nombre')).toBeInTheDocument();
    expect(screen.getByText('Email')).toBeInTheDocument();
    expect(screen.getByText('Rol')).toBeInTheDocument();
    expect(screen.getByText('Estado')).toBeInTheDocument();
    expect(screen.getByText('Acciones')).toBeInTheDocument();
  });

  // ===== TESTS DEL MODAL =====

  it('debe abrir el modal al hacer clic en Nuevo Usuario', async () => {
    render(<Usuarios />);
    
    const botonNuevo = screen.getByText('+ Nuevo Usuario');
    fireEvent.click(botonNuevo);
    
    await waitFor(() => {
      expect(screen.getByText('Nuevo Usuario')).toBeInTheDocument();
    });
  });

  it('debe mostrar todos los campos del formulario en el modal', async () => {
    render(<Usuarios />);
    
    fireEvent.click(screen.getByText('+ Nuevo Usuario'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/12345678-9/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/nombre completo/i)).toBeInTheDocument();
      expect(screen.getByPlaceholderText(/correo@ejemplo.com/i)).toBeInTheDocument();
    });
  });

  // ===== TESTS DE VALIDACIÓN =====

  it('debe mostrar errores si los campos están vacíos', async () => {
    render(<Usuarios />);
    
    fireEvent.click(screen.getByText('+ Nuevo Usuario'));
    
    await waitFor(() => {
      expect(screen.getByPlaceholderText(/12345678-9/i)).toBeInTheDocument();
    });

    const botonGuardar = screen.getByText('Guardar');
    fireEvent.click(botonGuardar);
    
    await waitFor(() => {
      expect(screen.getByText('El RUT es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El nombre es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El email es obligatorio')).toBeInTheDocument();
      expect(screen.getByText('El rol es obligatorio')).toBeInTheDocument();
    });
  });

  
});