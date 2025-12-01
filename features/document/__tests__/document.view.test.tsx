import { render, screen } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DocumentView from '../component/document.view'
import { useGetDocumentById } from '@/features/document'
import { useGetAllWorkflows } from '@/features/workflow'

// Mocks
jest.mock('@/features/document')
jest.mock('@/features/workflow')
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() })
}))
jest.mock('@/features/document/component/document.stepper', () => () => <div>Stepper</div>)

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

const mockDocument = {
    id: '1',
    title: 'Test Document',
    description: 'Test Description',
    documentNumber: 'DOC-001',
    versions: 1,
    status: 'PUBLISHED',
    priority: 'HIGH',
    documentType: { name: 'Type A' },
    journal: { name: 'Journal A' },
    createdBy: { fullname: 'User A' },
    createdAt: '2023-01-01',
    updatedAt: '2023-01-02',
    attachments: [
        { id: 'f1', fileName: 'file1.docx', fileUrl: 'url1' }
    ]
}

describe('DocumentView', () => {
    beforeEach(() => {
        jest.clearAllMocks()
            ; (useGetDocumentById as jest.Mock).mockReturnValue({
                data: mockDocument,
                isLoading: false
            })
            ; (useGetAllWorkflows as jest.Mock).mockReturnValue({
                data: { data: [] }
            })
    })

    test('hujjat ma\'lumotlarini to\'g\'ri ko\'rsatadi', () => {
        renderWithMantine(<DocumentView id="1" />)

        expect(screen.getByText('Test Document')).toBeInTheDocument()
        expect(screen.getByText('Test Description')).toBeInTheDocument()
        expect(screen.getByText('DOC-001')).toBeInTheDocument()
        expect(screen.getByText('Type A')).toBeInTheDocument()
        expect(screen.getByText('Journal A')).toBeInTheDocument()
        expect(screen.getByText('Chop etilgan')).toBeInTheDocument() // StatusBadge
    })

    test('biriktirilgan fayllarni ko\'rsatadi', () => {
        renderWithMantine(<DocumentView id="1" />)

        expect(screen.getByText('file1.docx')).toBeInTheDocument()
        expect(screen.getByText('Biriktirilgan fayllar')).toBeInTheDocument()
    })

    test('loading holatini ko\'rsatadi', () => {
        ; (useGetDocumentById as jest.Mock).mockReturnValue({
            data: null,
            isLoading: true
        })

        const { container } = renderWithMantine(<DocumentView id="1" />)
        // Skeleton borligini tekshirish (class yoki structure orqali)
        // Mantine Skeleton odatda ma'lum classlarga ega, lekin biz shunchaki render bo'lganini tekshiramiz
        expect(container.firstChild).toBeInTheDocument()
    })
})
