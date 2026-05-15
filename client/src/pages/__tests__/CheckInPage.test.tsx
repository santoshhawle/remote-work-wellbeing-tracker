import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckInPage from '../CheckInPage';

// ── Module mocks ────────────────────────────────────────────────────────────

vi.mock('react-router-dom', () => ({
  useNavigate: () => vi.fn(),
}));

vi.mock('../../contexts/AuthContext', () => ({
  useAuth: () => ({ user: { id: 42, email: 'alice@example.com', name: 'Alice', role: 'user' } }),
}));

const mockMarkCheckedInToday = vi.fn().mockReturnValue({ success: true });
vi.mock('../../services/notificationStorage', () => ({
  markCheckedInToday: (...args: unknown[]) => mockMarkCheckedInToday(...args),
}));

const mockCreate = vi.fn();
vi.mock('../../api', () => ({
  api: {
    logs: {
      getToday: vi.fn().mockResolvedValue(null),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}));

vi.mock('../../components/Header', () => ({
  default: () => <div data-testid="header" />,
}));

vi.mock('../../components/RatingInput', () => ({
  default: ({
    label,
    value,
    onChange,
  }: {
    label: string;
    value: number;
    onChange: (v: number) => void;
  }) => (
    <button data-testid={`rating-${label}`} onClick={() => onChange(7)}>
      {label}: {value}
    </button>
  ),
}));

// ── Helpers ─────────────────────────────────────────────────────────────────

function fillAllRatings() {
  fireEvent.click(screen.getByTestId('rating-😊 Mood'));
  fireEvent.click(screen.getByTestId('rating-⚡ Energy'));
  fireEvent.click(screen.getByTestId('rating-🎯 Focus'));
}

// ── Tests ────────────────────────────────────────────────────────────────────

describe('CheckInPage', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockCreate.mockResolvedValue({});
  });

  it('calls markCheckedInToday with the current user id after a successful submit', async () => {
    render(<CheckInPage />);
    fillAllRatings();
    fireEvent.click(screen.getByRole('button', { name: /save check-in/i }));

    await waitFor(() => {
      expect(mockMarkCheckedInToday).toHaveBeenCalledOnce();
      expect(mockMarkCheckedInToday).toHaveBeenCalledWith(42);
    });
  });

  it('does NOT call markCheckedInToday when api.logs.create rejects', async () => {
    mockCreate.mockRejectedValue(new Error('Server error'));
    render(<CheckInPage />);
    fillAllRatings();
    fireEvent.click(screen.getByRole('button', { name: /save check-in/i }));

    await waitFor(() => {
      expect(screen.getByText(/server error/i)).toBeInTheDocument();
    });
    expect(mockMarkCheckedInToday).not.toHaveBeenCalled();
  });

  it('shows validation error and does NOT submit if not all ratings are filled', async () => {
    render(<CheckInPage />);
    // Only fill one rating — leave others at 0
    fireEvent.click(screen.getByTestId('rating-😊 Mood'));
    fireEvent.click(screen.getByRole('button', { name: /save check-in/i }));

    await waitFor(() => {
      expect(screen.getByText(/please rate all three/i)).toBeInTheDocument();
    });
    expect(mockCreate).not.toHaveBeenCalled();
    expect(mockMarkCheckedInToday).not.toHaveBeenCalled();
  });
});
