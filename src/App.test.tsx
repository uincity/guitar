import { fireEvent, render, screen } from '@testing-library/react'
import App from './App'

describe('Guitar Chord Player', () => {
  it('starts with C major and changes root and type', () => {
    render(<App />)
    expect(screen.getByRole('heading', { name: 'C' })).toBeInTheDocument()
    expect(screen.getByText('X · 3 · 2 · 0 · 1 · 0')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: 'A' }))
    fireEvent.click(screen.getByRole('button', { name: /AmMinor/ }))
    expect(screen.getByRole('heading', { name: 'Am' })).toBeInTheDocument()
    expect(screen.getByText('X · 0 · 2 · 2 · 1 · 0')).toBeInTheDocument()
  })

  it('provides accessible playback controls', () => {
    const { container } = render(<App />)
    expect(screen.getByRole('button', { name: '코드 재생' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '다운 스트로크 재생' })).toBeEnabled()
    expect(screen.getByRole('button', { name: '업 스트로크 재생' })).toBeEnabled()
    expect([...container.querySelectorAll('.string-number')].map((label) => label.textContent)).toEqual(['1', '2', '3', '4', '5', '6'])
  })

  it('switches enharmonic roots without changing pitch and navigates voicings', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'Bb' }))
    expect(screen.getByRole('heading', { name: 'Bb' })).toBeInTheDocument()
    expect(screen.getByText('Bb · D · F')).toBeInTheDocument()
    expect(screen.getByText('A Shape')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '♯Sharp' }))
    expect(screen.getByRole('heading', { name: 'A#' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '다음 운지' }))
    expect(screen.getByText('E Shape')).toBeInTheDocument()
  })

  it('opens CAGED learning, changes Shape, and displays the full fretboard', () => {
    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: 'CAGED' }))
    expect(screen.getByText('CAGED LEARNING')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: 'C Major' })).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: /A3–5F/ }))
    expect(screen.getByRole('heading', { name: 'C Major — A Shape' })).toBeInTheDocument()
    expect(screen.getByText('X · 3 · 5 · 5 · 5 · 3')).toBeInTheDocument()
    fireEvent.click(screen.getByRole('button', { name: '전체 지판' }))
    expect(screen.getByLabelText('0에서 15프렛 CAGED 전체 지판')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'C Shape 듣기' })).toBeEnabled()
  })
})
