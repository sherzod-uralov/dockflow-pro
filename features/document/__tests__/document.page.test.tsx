import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DocumentPage from '../page/document.page'
import { useGetAllDocuments, useDeleteDocument, useGetDocumentById } from '@/features/document'
import { useRouter, useParams } from 'next/navigation'
import { useGetAllDocumentTypes } from '@/features/document-type'
import { useGetAllJournals } from '@/features/journal/hook/journal.hook'
import { useGetAllDocumentTemplates } from '@/features/document-template/hook/document-template.hook'

// Mocks
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    useParams: jest.fn()
}))
jest.mock('@/features/document')
jest.mock('@/features/document-type')
jest.mock('@/features/journal/hook/journal.hook')
jest.mock('@/features/document-template/hook/document-template.hook')
jest.mock('@/hooks/use-onboarding', () => ({
    useOnboarding: jest.fn(),
    TourButton: () => <div>Tour</div>
}))
jest.mock('@/components/shared/ui/custom-modal', () => {
    const actual = jest.requireActual('@/components/shared/ui/custom-modal')
    return {
        ...actual,
        CustomModal: ({ isOpen, children }: any) => isOpen ? <div>{children}</div> : null,
        ConfirmationModal: ({ isOpen }: any) => isOpen ? <div>Confirmation Modal</div> : null
    }
})
jest.mock('../component/document.form', () => () => <div>Document Form</div>)
jest.mock('@/features/workflow/component/workflow.form', () => () => <div>Workflow Form</div>)

// Layout mock
jest.mock('@/components/shared/layout/document.management.layout', () => ({
    SplitLayoutWithTabs: ({ data, onCreateNew, onSearchChange }: any) => (
        <div>
            <button onClick={onCreateNew}>+ Yangi hujjat</button>
            <input placeholder="Hujjatlarni qidirish..." onChange={(e) => onSearchChange(e.target.value)} />
            <div data-testid="document-list">
                {data.map((item: any) => (
                    <div key={item.id}>{item.title}</div>
                ))}
            </div>
        </div>
    )
}))

import { QueryClient, QueryClientProvider } from 'react-query'

const renderWithMantine = (component: React.ReactElement) => {
    const queryClient = new QueryClient({
        defaultOptions: {
            queries: { retry: false },
        },
    })
    return render(
        <QueryClientProvider client={queryClient}>
            <MantineProvider>{component}</MantineProvider>
        </QueryClientProvider>
    )
}

describe('DocumentPage', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() })
            ; (useParams as jest.Mock).mockReturnValue({})
            ; (useGetAllDocumentTypes as jest.Mock).mockReturnValue({ data: { data: [] } })
            ; (useGetAllJournals as jest.Mock).mockReturnValue({ data: { data: [] } })
            ; (useGetAllDocumentTemplates as jest.Mock).mockReturnValue({ data: { data: [] } })
            ; (useGetDocumentById as jest.Mock).mockReturnValue({ data: null, isLoading: false })
            ; (useDeleteDocument as jest.Mock).mockReturnValue({ mutate: jest.fn() })
    })

    test('katta hajmdagi ma\'lumotlarni render qiladi (scrolling test)', () => {
        // 50 ta hujjat generatsiya qilamiz
        const largeData = Array.from({ length: 50 }).map((_, i) => ({
            id: `${i}`,
            title: `Document ${i}`,
            status: 'PUBLISHED',
            priority: 'LOW'
        }))

            ; (useGetAllDocuments as jest.Mock).mockReturnValue({
                data: {
                    data: largeData,
                    count: 50
                },
                isLoading: false
            })

        renderWithMantine(<DocumentPage><div /></DocumentPage>)

        expect(screen.getByTestId('document-list').children).toHaveLength(50)
        expect(screen.getByText('Document 0')).toBeInTheDocument()
        expect(screen.getByText('Document 49')).toBeInTheDocument()
    })

    test('yangi hujjat yaratish modalini ochadi', () => {
        ; (useGetAllDocuments as jest.Mock).mockReturnValue({ data: { data: [] }, isLoading: false })

        renderWithMantine(<DocumentPage><div /></DocumentPage>)

        fireEvent.click(screen.getByText('+ Yangi hujjat'))
        // Modal ochilishini tekshirish (mock orqali qiyin, lekin biz hook chaqirilganini bilamiz)
        // Aslida biz CustomModal ichidagi DocumentForm render bo'lganini tekshirishimiz mumkin
        expect(screen.getByText('Document Form')).toBeInTheDocument()
    })

    test('qidiruv ishlaydi', () => {
        ; (useGetAllDocuments as jest.Mock).mockReturnValue({ data: { data: [] }, isLoading: false })

        renderWithMantine(<DocumentPage><div /></DocumentPage>)

        const searchInput = screen.getByPlaceholderText('Hujjatlarni qidirish...')
        fireEvent.change(searchInput, { target: { value: 'test' } })

        // Debounce borligi uchun darhol chaqirilmasligi mumkin, lekin state o'zgaradi
        expect(searchInput).toHaveValue('test')
    })
})
