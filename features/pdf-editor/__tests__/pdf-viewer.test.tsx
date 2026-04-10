import React from 'react'
import { render, screen, waitFor, fireEvent } from '@testing-library/react'
import { notifications } from '@mantine/notifications'
import { PDFViewer } from '../page'
import { pdfService } from '../service/pdf.service'

jest.mock('../service/pdf.service')
jest.mock('@mantine/notifications')
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        back: jest.fn(),
    }),
    useSearchParams: () => ({
        get: jest.fn((key: string) => {
            if (key === 'workflowId') return 'workflow123'
            if (key === 'actionType') return 'QR_CODE'
            return null
        })
    })
}))

jest.mock('@/features/login/hook/login.hook', () => ({
    useGetProfileQuery: () => ({
        data: { fullname: 'Test User' }
    })
}))

// Mock DocVerse Viewer
const mockInstance = {
    Core: {
        documentViewer: {
            getCurrentPage: jest.fn(() => 1),
        },
        annotationManager: {
            exportAnnotations: jest.fn(() => Promise.resolve('<xfdf></xfdf>')),
            enableReadOnlyMode: jest.fn(),
        },
    },
    UI: {
        addQRCode: jest.fn(() => Promise.resolve()),
        addSignatureStamp: jest.fn(() => Promise.resolve()),
        disableFeatures: jest.fn(),
        disableElements: jest.fn(),
    },
    dispose: jest.fn(),
}

jest.mock('@docverse-pdf/next', () => ({
    DocVerseViewer: jest.fn((props: any) => {
        React.useEffect(() => {
            if (props.onReady) {
                props.onReady(mockInstance)
            }
        }, [])
        return <div data-testid="docverse-viewer" />
    }),
}))

describe('PDFViewer', () => {
    beforeEach(() => {
        jest.clearAllMocks()
        ;(pdfService.getDocument as jest.Mock).mockResolvedValue({
            pdfUrl: 'https://example.com/test.pdf'
        })
    })

    test('PDF yuklanishini ko\'rsatadi', async () => {
        render(<PDFViewer documentId="doc123" />)

        expect(screen.getByText(/PDF yuklanmoqda/i)).toBeInTheDocument()
    })

    test('QR kod tugmasi ko\'rinadi', async () => {
        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            expect(screen.getByText(/QR kod/i)).toBeInTheDocument()
        })
    })

    test('QR kod qo\'shish funksiyasi ishlaydi', async () => {
        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            expect(screen.getByText(/QR kod/i)).toBeInTheDocument()
        })

        const qrButton = screen.getByText(/QR kod/i)
        fireEvent.click(qrButton)

        await waitFor(() => {
            expect(mockInstance.UI.addQRCode).toHaveBeenCalledWith(
                'https://e-hujjat.nordicuniversity.org/view/doc123',
                0,
                100,
                100,
                70
            )
        })
    })

    test('saqlash funksiyasi ishlaydi', async () => {
        ;(pdfService.saveAnnotations as jest.Mock).mockResolvedValue({})

        render(<PDFViewer documentId="doc123" />)

        await waitFor(() => {
            const saveButton = screen.getByText(/Saqlash/i)
            expect(saveButton).toBeInTheDocument()
        })

        const saveButton = screen.getByText(/Saqlash/i)
        fireEvent.click(saveButton)

        await waitFor(() => {
            expect(pdfService.saveAnnotations).toHaveBeenCalled()
            expect(notifications.show).toHaveBeenCalledWith(
                expect.objectContaining({
                    title: 'Saqlandi'
                })
            )
        })
    })

    test('documentId bo\'lmasa xatolik ko\'rsatadi', () => {
        render(<PDFViewer />)

        expect(screen.getByText(/PDF yuklanmoqda/i)).toBeInTheDocument()
    })
})
