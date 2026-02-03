import { renderHook, waitFor } from '@testing-library/react'
import { QueryClient, QueryClientProvider } from 'react-query'
import {
    useCreateDocument,
    useGetAllDocuments,
    useUpdateDocument,
    useDeleteDocument,
    useGetDocumentById
} from '../hook/document.hook'
import { documentService } from '../service/document.service'
import { showSuccess } from '@/utils/show-error'

jest.mock('../service/document.service')
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

describe('document hooks', () => {
    beforeEach(() => {
        jest.clearAllMocks()
    })

    describe('useCreateDocument', () => {
        test('muvaffaqiyatli yaratish', async () => {
            ; (documentService.create as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useCreateDocument(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({
                title: 'New Doc',
                description: 'Desc',
                documentNumber: 'DOC-001',
                status: 'DRAFT',
                documentTypeId: 'type1',
                journalId: 'journal1',
                templateId: 'temp1',
                tags: {},
                attachments: []
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Hujjat muvaffaqiyatli yaratildi")
        })
    })

    describe('useGetAllDocuments', () => {
        test('ma\'lumotlarni olib keladi', async () => {
            const mockData = { data: [], total: 0 }
                ; (documentService.getAll as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetAllDocuments(), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })

    describe('useUpdateDocument', () => {
        test('muvaffaqiyatli yangilash', async () => {
            ; (documentService.update as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useUpdateDocument(), {
                wrapper: createWrapper(),
            })

            result.current.mutate({
                id: '1',
                data: { title: 'Updated' }
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Hujjat muvaffaqiyatli yangilandi")
        })
    })

    describe('useDeleteDocument', () => {
        test('muvaffaqiyatli o\'chirish', async () => {
            ; (documentService.delete as jest.Mock).mockResolvedValue({})

            const { result } = renderHook(() => useDeleteDocument(), {
                wrapper: createWrapper(),
            })

            result.current.mutate('1')

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(showSuccess).toHaveBeenCalledWith("Hujjat muvaffaqiyatli o'chirildi")
        })
    })

    describe('useGetDocumentById', () => {
        test('ID bo\'yicha olib keladi', async () => {
            const mockData = { id: '1', title: 'Doc 1' }
                ; (documentService.getById as jest.Mock).mockResolvedValue(mockData)

            const { result } = renderHook(() => useGetDocumentById('1'), {
                wrapper: createWrapper(),
            })

            await waitFor(() => {
                expect(result.current.isSuccess).toBe(true)
            })

            expect(result.current.data).toEqual(mockData)
        })
    })
})
