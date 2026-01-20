import { render, screen, fireEvent } from '@testing-library/react'
import { MantineProvider } from '@mantine/core'
import DepartmentView from '../component/department.view'

const renderWithMantine = (component: React.ReactElement) => {
    return render(<MantineProvider>{component}</MantineProvider>)
}

const mockDepartment = {
    id: '123456789',
    name: 'IT Department',
    description: 'Information Technology',
    code: 'IT-01',
    location: '3rd Floor',
    parent: {
        id: 'parent1',
        name: 'Head Office'
    },
    director: {
        id: 'dir1',
        fullname: 'John Doe',
        username: 'johndoe',
        avatarUrl: 'https://example.com/avatar.jpg'
    }
}

describe('DepartmentView', () => {
    test('barcha ma\'lumotlarni to\'g\'ri ko\'rsatadi', () => {
        renderWithMantine(<DepartmentView department={mockDepartment as any} />)

        // Asosiy ma'lumotlar
        expect(screen.getByText('IT Department')).toBeInTheDocument()
        expect(screen.getByText('Information Technology')).toBeInTheDocument()

        // Kod va joylashuv
        expect(screen.getByText('IT-01')).toBeInTheDocument()
        expect(screen.getByText('3rd Floor')).toBeInTheDocument()

        // Parent va Director
        expect(screen.getByText('Head Office')).toBeInTheDocument()
        expect(screen.getByText('John Doe')).toBeInTheDocument()
        expect(screen.getByText('@johndoe')).toBeInTheDocument()
    })

    test('bo\'sh ma\'lumotlar bilan to\'g\'ri ishlaydi', () => {
        const emptyDepartment = {
            id: '1',
            name: 'Empty Dept',
            description: null,
            code: null,
            location: null,
            parent: null,
            director: null
        }

        renderWithMantine(<DepartmentView department={emptyDepartment as any} />)

        expect(screen.getByText('Empty Dept')).toBeInTheDocument()
        expect(screen.getAllByText('Kiritilmagan')).toHaveLength(2) // Code va Location uchun
    })

    test('ID nusxalash tugmasi mavjud', () => {
        renderWithMantine(<DepartmentView department={mockDepartment as any} />)

        expect(screen.getByText(/ID: 12345678/)).toBeInTheDocument()
    })
})
