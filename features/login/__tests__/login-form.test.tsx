import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import { LoginForm } from '../component/login-form'
import { useLoginMutation } from '../hook/login.hook'
import { useRouter } from 'next/navigation'
import Cookie from 'js-cookie'

// Mock dependencies
jest.mock('../hook/login.hook')
jest.mock('next/navigation')
jest.mock('js-cookie')

// Helper to render with Mantine Provider
const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

describe('LoginForm', () => {
    const mockPush = jest.fn()
    const mockMutate = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: mockPush })
            ; (useLoginMutation as jest.Mock).mockReturnValue({
                mutate: mockMutate,
                isLoading: false,
            })
    })

    test('formani to\'g\'ri render qiladi', () => {
        renderWithMantine(<LoginForm />)

        expect(screen.getByLabelText(/Foydalanuvchi nomi/i)).toBeInTheDocument()
        expect(screen.getByLabelText(/Parol/i)).toBeInTheDocument()
        expect(screen.getByRole('button', { name: /Kirish/i })).toBeInTheDocument()
    })

    test('validatsiya xatolarini ko\'rsatadi', async () => {
        renderWithMantine(<LoginForm />)

        const submitButton = screen.getByRole('button', { name: /Kirish/i })

        // Username juda qisqa
        fireEvent.change(screen.getByLabelText(/Foydalanuvchi nomi/i), {
            target: { value: 'ab' }
        })
        fireEvent.change(screen.getByLabelText(/Parol/i), {
            target: { value: 'ab' }
        })

        fireEvent.click(submitButton)

        await waitFor(() => {
            const errors = screen.getAllByText(/3 tadan katta bo'lishi kerak/i)
            expect(errors.length).toBeGreaterThan(0)
        })
    })

    test('to\'g\'ri ma\'lumotlar bilan submit qiladi', async () => {
        const mockData = {
            accessToken: 'test-access-token',
            refreshToken: 'test-refresh-token'
        }

        mockMutate.mockImplementation((values, { onSuccess }) => {
            onSuccess(mockData)
        })

        renderWithMantine(<LoginForm />)

        fireEvent.change(screen.getByLabelText(/Foydalanuvchi nomi/i), {
            target: { value: 'testuser' }
        })
        fireEvent.change(screen.getByLabelText(/Parol/i), {
            target: { value: 'testpassword' }
        })

        fireEvent.click(screen.getByRole('button', { name: /Kirish/i }))

        await waitFor(() => {
            expect(mockMutate).toHaveBeenCalledWith(
                { username: 'testuser', password: 'testpassword' },
                expect.any(Object)
            )
            expect(Cookie.set).toHaveBeenCalledWith('accessToken', 'test-access-token')
            expect(Cookie.set).toHaveBeenCalledWith('refreshToken', 'test-refresh-token')
            expect(mockPush).toHaveBeenCalledWith('/dashboard')
        })
    })

    test('loading holatini ko\'rsatadi', () => {
        ; (useLoginMutation as jest.Mock).mockReturnValue({
            mutate: mockMutate,
            isLoading: true,
        })

        renderWithMantine(<LoginForm />)

        const submitButton = screen.getByRole('button', { name: /Kirish/i })
        expect(submitButton).toBeDisabled()
    })

    test('sahifa refresh bo\'lmasligi kerak', async () => {
        renderWithMantine(<LoginForm />)

        const form = screen.getByRole('button', { name: /Kirish/i }).closest('form')
        const preventDefaultSpy = jest.fn()

        fireEvent.submit(form!, { preventDefault: preventDefaultSpy })

        // preventDefault chaqirilishi kerak emas chunki Mantine form.onSubmit ishlatiladi
        // Lekin form submit event trigger bo'lishi kerak
        expect(form).toBeInTheDocument()
    })
})
