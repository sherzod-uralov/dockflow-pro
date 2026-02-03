import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    useCreateDepartment,
    useGetAllDepartments,
    useUpdateDepartment,
    useDeleteDepartment,
    useGetDepartmentById
} from '../hook/department.hook'
import { departmentService } from '../service/department.service'
import { showSuccess } from '@/utils/show-error'

jest.mock('../service/department.service')
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

describe('department hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useCreateDepartment', () => {
        test('muvaffaqiyatli yaratish', async () => {
            ; (departmentService.create as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useCreateDepartment(), {
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

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim muvaffaqiyatli qo'shildi")
        })
    })

    describe('useGetAllDepartments', () => {
        test('ma\'lumotlarni olib keladi', async () => {
            const mockData = { data: [], total: 0 }
                ; (departmentService.getAll as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetAllDepartments(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })

    describe('useUpdateDepartment', () => {
        test('muvaffaqiyatli yangilash', async () => {
            ; (departmentService.update as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useUpdateDepartment(), {
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

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim muvaffaqiyatli yangilandi")
        })
    })

    describe('useDeleteDepartment', () => {
        test('muvaffaqiyatli o\'chirish', async () => {
            ; (departmentService.delete as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useDeleteDepartment(), {
                wrapper: createWrapper(),
            })

            result.current.mutate('1')

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Bo'lim o'chirildi")
        })
    })

    describe('useGetDepartmentById', () => {
        test('ID bo\'yicha olib keladi', async () => {
            const mockData = { id: '1', name: 'Dept' }
                ; (departmentService.getById as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetDepartmentById('1'), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })
})
