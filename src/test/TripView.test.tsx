import { render, screen, fireEvent, waitFor, act } from '@testing-library/react'
import { describe, it, expect, vi, beforeEach } from 'vitest'
import { TripViewPage } from '../pages/TripViewPage'
import { BrowserRouter, useParams } from 'react-router-dom'
import { supabase } from '../lib/supabase'

// Mock navigate and params
const mockedNavigate = vi.fn()
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom')
  return {
    ...actual,
    useNavigate: () => mockedNavigate,
    useParams: vi.fn(),
  }
})

// Mock useAuth
vi.mock('../contexts/AuthContext', () => ({
  useAuth: () => ({
    logout: vi.fn(),
  }),
}))

describe('TripViewPage & DailyPlan', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useParams).mockReturnValue({ id: 'trip-123' })
  })

  const mockTrip = {
    id: 'trip-123',
    destination: 'Paris',
    start_date: '2026-05-01',
    end_date: '2026-05-02',
    people_count: 2,
  }
  const mockDetails = {
    trip_id: 'trip-123',
    accommodation_snippet: 'Initial hotel',
    transport_snippet: '',
  }
  const mockActivities = [
    {
      id: 'act-1',
      trip_id: 'trip-123',
      activity_date: '2026-05-01',
      description: 'Activity 1',
      time_range: '10:00',
      maps_url: null,
    }
  ]

  it('should trigger autosave after typing and waiting', async () => {
    // Mock initial fetch
    const mockSingle = vi.fn()
      .mockResolvedValueOnce({ data: mockTrip, error: null })
      .mockResolvedValueOnce({ data: mockDetails, error: null })

    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      update: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockActivities, error: null }),
      single: mockSingle
    } as any)

    render(
      <BrowserRouter>
        <TripViewPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText('Paris')).toBeInTheDocument()
    })

    vi.mocked(supabase.from).mockClear()
    vi.useFakeTimers()

    const textarea = screen.getByPlaceholderText(/Nome do hotel/i)
    fireEvent.change(textarea, { target: { value: 'Updated hotel info' } })
    expect(supabase.from).not.toHaveBeenCalled()

    act(() => {
      vi.advanceTimersByTime(1000)
    })

    expect(supabase.from).toHaveBeenCalledWith('trip_details')
    vi.useRealTimers()
    
    await waitFor(() => {
      expect(screen.getByText(/SALVO/i)).toBeInTheDocument()
    })
  })

  it('should render daily plan and open activity modal', async () => {
    vi.mocked(supabase.from).mockReturnValue({
      select: vi.fn().mockReturnThis(),
      eq: vi.fn().mockReturnThis(),
      order: vi.fn().mockResolvedValue({ data: mockActivities, error: null }),
      single: vi.fn()
        .mockResolvedValueOnce({ data: mockTrip, error: null })
        .mockResolvedValueOnce({ data: mockDetails, error: null })
    } as any)

    render(
      <BrowserRouter>
        <TripViewPage />
      </BrowserRouter>
    )

    await waitFor(() => {
      expect(screen.getByText(/Roteiro Diário/i)).toBeInTheDocument()
    })

    // Day 1 should be there (2026-05-01 is Friday)
    expect(screen.getByText(/sexta-feira, 01 de maio/i)).toBeInTheDocument()
    
    // Expand day 1
    const dayButton = screen.getByText(/sexta-feira, 01 de maio/i).closest('button')!
    fireEvent.click(dayButton)

    // Should see Activity 1
    expect(screen.getByText('Activity 1')).toBeInTheDocument()

    // Click add activity
    const addButton = screen.getByText(/Adicionar Atividade/i)
    fireEvent.click(addButton)

    // Modal should be open
    expect(screen.getByText('Nova Atividade')).toBeInTheDocument()
    expect(screen.getByLabelText(/Descrição/i)).toBeInTheDocument()
  })
})
