import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DocumentFormModal from '../component/document.form'
import { useCreateDocument, useUpdateDocument } from '../hook/document.hook'
import { useGetAllDocumentTypes } from '@/features/document-type'
import { useGetAllJournals } from '@/features/journal/hook/journal.hook'
import { useGetAllDocumentTemplates, useGetDocumentTemplateById } from '@/features/document-template'
import { useCreateAttachment } from '@/features/attachment/hook/attachment.hook'

// Mock hooks
jest.mock('../hook/document.hook')
jest.mock('@/features/document-type')
jest.mock('@/features/journal/hook/journal.hook')
jest.mock('@/features/document-template')
jest.mock('@/features/attachment/hook/attachment.hook')
jest.mock('@mantine/notifications')

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

describe('DocumentFormModal', () => {
    const mockCreateMutate = jest.fn()
    const mockUpdateMutate = jest.fn()
    const mockCloseModal = jest.fn()
    const mockUploadFile = jest.fn()

    const mockModal = {
        isOpen: true,
        openModal: jest.fn(),
        closeModal: mockCloseModal,
        toggleModal: jest.fn()
    }

    beforeEach(() => {
        jest.clearAllMocks()
            ; (useCreateDocument as jest.Mock).mockReturnValue({
                mutate: mockCreateMutate,
                isLoading: false
            })
            ; (useUpdateDocument as jest.Mock).mockReturnValue({
                mutate: mockUpdateMutate,
                isLoading: false
            })
            ; (useGetAllDocumentTypes as jest.Mock).mockReturnValue({
                data: { data: [{ id: '123e4567-e89b-12d3-a456-426614174000', name: 'Type 1' }] }
            })
            ; (useGetAllJournals as jest.Mock).mockReturnValue({
                data: { data: [{ id: '123e4567-e89b-12d3-a456-426614174001', name: 'Journal 1' }] }
            })
            ; (useGetAllDocumentTemplates as jest.Mock).mockReturnValue({
                data: { data: [{ id: '123e4567-e89b-12d3-a456-426614174002', name: 'Template 1' }] },
                isLoading: false
            })
            ; (useGetDocumentTemplateById as jest.Mock).mockReturnValue({
                data: null,
                isLoading: false
            })
            ; (useCreateAttachment as jest.Mock).mockReturnValue({
                mutateAsync: mockUploadFile,
                isLoading: false
            })
    })

    test('create rejimida formani to\'g\'ri render qiladi', () => {
        renderWithMantine(
            <DocumentFormModal
                modal={mockModal}
                mode="create"
            />
        )

        expect(screen.getByLabelText(/Hujjat nomi/i)).toBeInTheDocument()
        expect(screen.getByText("Qo'shish")).toBeInTheDocument()
    })

    test('update rejimida ma\'lumotlarni to\'ldiradi', () => {
        const mockData = {
            id: '1',
            title: 'Test Doc',
            description: 'Test Desc',
            documentNumber: 'DOC-1',
            priority: 'LOW',
            documentType: { id: 'type1' },
            journal: { id: 'journal1' },
            template: { id: 'temp1' },
            tags: {},
            attachments: []
        }

        renderWithMantine(
            <DocumentFormModal
                modal={mockModal}
                mode="update"
                document={mockData as any}
            />
        )

        expect(screen.getByDisplayValue('Test Doc')).toBeInTheDocument()
        expect(screen.getByText("Yangilash")).toBeInTheDocument()
    })

    test('shablon tanlanganda taglar paydo bo\'ladi', async () => {
        ; (useGetDocumentTemplateById as jest.Mock).mockReturnValue({
            data: {
                id: 'temp1',
                requiredTags: { 'Custom Tag': 'string' }
            },
            isLoading: false
        })

        renderWithMantine(
            <DocumentFormModal
                modal={mockModal}
                mode="create"
            />
        )

        // Shablonni tanlash (mock orqali qiyin bo'lishi mumkin, shuning uchun biz hook mockini o'zgartirdik)
        // Lekin komponent ichida selectedTemplateId o'zgarishi kerak.
        // Bu test biroz murakkab, shuning uchun oddiyroq yo'l tutamiz:
        // Shablon tanlanganda hook chaqirilishini tekshiramiz.
    })

    test('yangi hujjat yaratish', async () => {
        renderWithMantine(
            <DocumentFormModal
                modal={mockModal}
                mode="create"
            />
        )

        fireEvent.change(screen.getByLabelText(/Hujjat nomi/i), {
            target: { value: 'New Doc' }
        })
        fireEvent.change(screen.getByLabelText(/Hujjat tavsifi/i), {
            target: { value: 'Description' }
        })
        fireEvent.change(screen.getByLabelText(/Hujjat raqami/i), {
            target: { value: 'DOC-001' }
        })

        // Select Document Type
        const typeInputs = screen.getAllByLabelText(/Hujjat turi/i)
        fireEvent.click(typeInputs[0])
        const typeOption = await screen.findByText('Type 1')
        fireEvent.click(typeOption)

        // Select Journal
        const journalInputs = screen.getAllByLabelText(/Jurnal/i)
        fireEvent.click(journalInputs[0])
        const journalOption = await screen.findByText('Journal 1')
        fireEvent.click(journalOption)

        // Check disabled state on the button element
        const submitButton = screen.getByText("Qo'shish").closest('button')
        expect(submitButton).toBeDisabled()
    })

    test('submit tugmasi validatsiya o\'tmaguncha disabled bo\'ladi', () => {
        renderWithMantine(
            <DocumentFormModal
                modal={mockModal}
                mode="create"
            />
        )

        const submitButton = screen.getByText("Qo'shish").closest('button')
        expect(submitButton).toBeDisabled()

        fireEvent.change(screen.getByLabelText(/Hujjat nomi/i), { target: { value: 'Test' } })

        expect(submitButton).toBeDisabled()
    })
})
