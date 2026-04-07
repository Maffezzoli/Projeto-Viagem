import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { DashboardPage } from '../pages/DashboardPage'
import { BrowserRouter } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Mock navigate
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
  }
})

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}))

describe('DashboardPage', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('should render the dashboard with empty state', async () => {
    // Mock empty response from Supabase
    const mockSelect = vi.fn().mockResolvedValue({ data: [], error: null })
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockSelect,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    expect(screen.getByText(/Minhas Viagens/i)).toBeInTheDocument()
    
    await waitFor(() => {
      expect(screen.getByText(/Nenhuma viagem encontrada/i)).toBeInTheDocument()
    })
  })

  it('should render trips when they exist', async () => {
    const mockTrips = [
      {
        id: '1',
        destination: 'Paris',
        start_date: '2026-05-01',
        end_date: '2026-05-10',
        people_count: 2,
      },
    ]

    const mockSelect = vi.fn().mockResolvedValue({ data: mockTrips, error: null })
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      order: mockSelect,
    } as any)

    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument()
      expect(screen.getByText(/2 pessoas/i)).toBeInTheDocument()
    })
  })

  it('should open the New Trip Modal when clicking the button', async () => {
    render(
      <BrowserRouter>
        <DashboardPage />
      </BrowserRouter>
    )

    const button = screen.getByRole('button', { name: /Nova Viagem/i })
    fireEvent.click(button)

    expect(screen.getByRole('heading', { name: 'Nova Viagem' })).toBeInTheDocument()
    expect(screen.getByLabelText(/Destino/i)).toBeInTheDocument()
  })
})
