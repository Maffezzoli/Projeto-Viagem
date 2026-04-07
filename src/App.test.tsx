import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, beforeEach } from 'vitest'
import App from './App'

describe('App & GatePage', () => {
  beforeEach(() => {
    localStorage.clear();
    // Use the default password from the code if not set in process.env
    // But since it's hardcoded in the context or .env, we can just use the default 'senha1234'
  });

  it('should render the Gate Page initially', () => {
    render(<App />)
    expect(screen.getByText(/Personal Travel Planner/i)).toBeInTheDocument()
    expect(screen.getByPlaceholderText(/Senha de acesso/i)).toBeInTheDocument()
  })

  it('should show error for incorrect password', () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Senha de acesso/i)
    const button = screen.getByRole('button', { name: /Acessar/i })

    fireEvent.change(input, { target: { value: 'wrongpassword' } })
    fireEvent.click(button)

    expect(screen.getByText(/Senha incorreta/i)).toBeInTheDocument()
  })

  it('should redirect to dashboard with correct password', async () => {
    render(<App />)
    const input = screen.getByPlaceholderText(/Senha de acesso/i)
    const button = screen.getByRole('button', { name: /Acessar/i })

    // Correct password from .env
    fireEvent.change(input, { target: { value: 'floresta123Pp!' } })
    fireEvent.click(button)

    await waitFor(() => {
      expect(screen.getByText(/Minhas Viagens/i)).toBeInTheDocument()
    })
  })

  it('should maintain session on reload', async () => {
    localStorage.setItem('app_viagem_auth', 'true');
    render(<App />)
    
    await waitFor(() => {
      expect(screen.getByText(/Minhas Viagens/i)).toBeInTheDocument()
    })
  })

  it('should protect dashboard route', () => {
    // Navigate to dashboard directly (though in this test setup it's difficult without complex router mocking)
    // But we can verify that without localStorage, it renders the GatePage
    render(<App />)
    expect(screen.getByText(/Personal Travel Planner/i)).toBeInTheDocument()
    expect(screen.queryByText(/Minhas Viagens/i)).not.toBeInTheDocument()
  })
})
