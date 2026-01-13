import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DeportamentFormModal from '../component/deportament.form'
import { useCreateDeportament, useUpdateDeportament } from '../hook/deportament.hook'
import { useGetUserQuery } from '@/features/admin/admin-users/hook/user.hook'

// Mock hooks
jest.mock('../hook/deportament.hook')
jest.mock('@/features/admin/admin-users/hook/user.hook')

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

describe('DeportamentFormModal', () => {
    const mockCreateMutate = jest.fn()
    const mockUpdateMutate = jest.fn()
    const mockOnClose = jest.fn()

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useCreateDeportament as jest.Mock).mockReturnValue({
                mutate: mockCreateMutate,
                isLoading: false
            })
            ; (useUpdateDeportament as jest.Mock).mockReturnValue({
                mutate: mockUpdateMutate,
                isLoading: false
            })
            ; (useGetUserQuery as jest.Mock).mockReturnValue({
                data: {
                    data: [
                        { id: 'user1', fullname: 'User One' },
                        { id: 'user2', fullname: 'User Two' }
                    ]
                },
                isLoading: false
            })
    })

    test('create rejimida formani to\'g\'ri render qiladi', () => {
        renderWithMantine(
            <DeportamentFormModal
                mode="create"
                onClose={mockOnClose}
            />
        )

        expect(screen.getByLabelText(/Bo'lim nomi/i)).toBeInTheDocument()
        expect(screen.getByText("Qo'shish")).toBeInTheDocument()
    })

    test('update rejimida ma\'lumotlarni to\'ldiradi', () => {
        const mockData = {
            id: '1',
            name: 'Test Dept',
            description: 'Test Desc',
            code: 'TD',
            location: 'Test Loc',
            director: { id: 'user1', fullname: 'User One' }
        }

        renderWithMantine(
            <DeportamentFormModal
                mode="update"
                deportament={mockData as any}
                onClose={mockOnClose}
            />
        )

        expect(screen.getByDisplayValue('Test Dept')).toBeInTheDocument()
        expect(screen.getByText("Yangilash")).toBeInTheDocument()
    })

    test('validatsiya ishlaydi', async () => {
        renderWithMantine(
            <DeportamentFormModal
                mode="create"
                onClose={mockOnClose}
            />
        )

        const submitButton = screen.getByText("Qo'shish")
        await waitFor(() => {
            expect(mockCreateMutate).not.toHaveBeenCalled()
        })
    })

    test('yangi bo\'lim yaratish', async () => {
        renderWithMantine(
            <DeportamentFormModal
                mode="create"
                onClose={mockOnClose}
            />
        )

        fireEvent.change(screen.getByLabelText(/Bo'lim nomi/i), {
            target: { value: 'New Dept' }
        })

        fireEvent.click(screen.getByText("Qo'shish"))

        await waitFor(() => {
            expect(mockCreateMutate).toHaveBeenCalledWith(
                expect.objectContaining({ name: 'New Dept' }),
                expect.any(Object)
            )
        })
    })

    test('bo\'limni yangilash', async () => {
        const mockData = {
            id: '1',
            name: 'Old Name'
        }

        renderWithMantine(
            <DeportamentFormModal
                mode="update"
                deportament={mockData as any}
                onClose={mockOnClose}
            />
        )

        fireEvent.change(screen.getByLabelText(/Bo'lim nomi/i), {
            target: { value: 'New Name' }
        })

        fireEvent.click(screen.getByText("Yangilash"))

        await waitFor(() => {
            expect(mockUpdateMutate).toHaveBeenCalledWith(
                expect.objectContaining({
                    id: '1',
                    data: expect.objectContaining({ name: 'New Name' })
                }),
                expect.any(Object)
            )
        })
    })
})
