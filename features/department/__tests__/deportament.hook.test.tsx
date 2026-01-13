import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    useCreateDeportament,
    useGetAllDeportaments,
    useUpdateDeportament,
    useDeleteDeportament,
    useGetDeportamentById
} from '../hook/deportament.hook'
import { deportamentService } from '../service/deportament.service'
import { showSuccess } from '@/utils/show-error'

jest.mock('../service/deportament.service')
jest.mock('@/utils/show-error', () => ({
    showSuccess: jest.fn(),
    showError: jest.fn()
}))

const createWrapper = () => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
            mutations: { retry: false },
        },
    })
    return ({ children }: { children: React.ReactNode }) => (
        <QueryClientProvider client={queryClient}>{children}</QueryClientProvider>
    )
}

describe('deportament hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useCreateDeportament', () => {
        test('muvaffaqiyatli yaratish', async () => {
            ; (deportamentService.create as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useCreateDeportament(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({
                name: 'New Dept',
                description: 'Desc',
                code: 'ND',
                location: 'Loc',
                directorId: 'user1'
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim yaratildi")
        })
    })

    describe('useGetAllDeportaments', () => {
        test('ma\'lumotlarni olib keladi', async () => {
            const mockData = { data: [], total: 0 }
                ; (deportamentService.getAll as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetAllDeportaments(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })

    describe('useUpdateDeportament', () => {
        test('muvaffaqiyatli yangilash', async () => {
            ; (deportamentService.update as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useUpdateDeportament(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({
                id: '1',
                data: {
                    name: 'Updated',
                    description: 'Desc',
                    code: 'UP',
                    location: 'Loc'
                }
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim yangilandi")
        })
    })

    describe('useDeleteDeportament', () => {
        test('muvaffaqiyatli o\'chirish', async () => {
            ; (deportamentService.delete as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useDeleteDeportament(), {
                wrapper: createWrapper(),
            })

            result.current.mutate('1')

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim o'chirildi")
        })
    })

    describe('useGetDeportamentById', () => {
        test('ID bo\'yicha olib keladi', async () => {
            const mockData = { id: '1', name: 'Dept' }
                ; (deportamentService.getById as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetDeportamentById('1'), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })
})
