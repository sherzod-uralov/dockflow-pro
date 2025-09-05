# Custom Modal Components

Bu loyihada shadcn/ui asosida yaratilgan custom modal componentlari to'plami. Bu componentlar Next.js va TypeScript bilan ishlab chiqilgan.

## Mavjud Componentlar

### 1. `CustomModal` - Asosiy modal component
### 2. `ConfirmationModal` - Tasdiqlash uchun modal
### 3. `InfoModal` - Ma'lumot ko'rsatish uchun modal
### 4. `ModalProvider` - Global modal management
### 5. `useModal` - Oddiy modal hook
### 6. `useAdvancedModal` - Kengaytirilgan modal hook
### 7. `useModalWithForm` - Form bilan modal hook
### 8. `useConfirmationModal` - Tasdiqlash modal hook
### 9. `useWizardModal` - Ko'p bosqichli modal hook

## O'rnatish

Modal componentlari allaqachon loyihada mavjud. Faqat import qiling:

```tsx
import { CustomModal, useModal, ConfirmationModal, InfoModal } from '@/components/ui/custom-modal'
```

## Asosiy Foydalanish

### 1. Oddiy Modal

```tsx
import { CustomModal, useModal } from '@/components/ui/custom-modal'

function MyComponent() {
  const modal = useModal()

  return (
    <>
      <button onClick={modal.openModal}>
        Modalni Ochish
      </button>
      
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title="Sarlavha"
        description="Bu modal haqida qisqacha ma'lumot"
        size="md"
      >
        <p>Modal contenti shu yerda bo'ladi</p>
      </CustomModal>
    </>
  )
}
```

### 2. Tasdiqlash Modali

```tsx
import { ConfirmationModal, useModal } from '@/components/ui/custom-modal'

function DeleteButton() {
  const confirmModal = useModal()

  const handleDelete = () => {
    // O'chirish logikasi
    console.log("Element o'chirildi")
  }

  return (
    <>
      <button onClick={confirmModal.openModal}>
        O'chirish
      </button>
      
      <ConfirmationModal
        isOpen={confirmModal.isOpen}
        onClose={confirmModal.closeModal}
        onConfirm={handleDelete}
        title="O'chirish tasdiqi"
        description="Bu elementni o'chirishni xohlaysizmi?"
        confirmText="O'chirish"
        cancelText="Bekor qilish"
        variant="destructive"
      />
    </>
  )
}
```

### 3. Form Modal

```tsx
import { CustomModal, useModal } from '@/components/ui/custom-modal'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

function FormModal() {
  const modal = useModal()
  const [name, setName] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    // Form submit logikasi
    modal.closeModal()
  }

  return (
    <>
      <Button onClick={modal.openModal}>
        Form Ochish
      </Button>
      
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title="Ma'lumotlarni Kiriting"
        size="lg"
        footer={
          <div className="flex gap-2">
            <Button variant="outline" onClick={modal.closeModal}>
              Bekor qilish
            </Button>
            <Button form="my-form" type="submit">
              Saqlash
            </Button>
          </div>
        }
      >
        <form id="my-form" onSubmit={handleSubmit}>
          <Input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Ismingizni kiriting"
          />
        </form>
      </CustomModal>
    </>
  )
}
```

## Kengaytirilgan Foydalanish

### 1. useAdvancedModal Hook

```tsx
import { useAdvancedModal } from '@/hooks/use-advanced-modal'

function AdvancedModalExample() {
  const modal = useAdvancedModal({
    size: 'lg',
    closeOnOverlayClick: false,
    closeOnEscape: true,
    onOpen: () => console.log('Modal ochildi'),
    onClose: () => console.log('Modal yopildi'),
    preventClose: () => {
      // Modal yopilishini to'xtatish sharti
      return false
    }
  })

  return (
    <>
      <button onClick={modal.openModal}>
        Advanced Modal
      </button>
      
      <CustomModal
        isOpen={modal.isOpen}
        onClose={modal.closeModal}
        title="Advanced Modal"
        {...modal.options}
      >
        <p>Kengaytirilgan xususiyatlar bilan modal</p>
      </CustomModal>
    </>
  )
}
```

### 2. useModalWithForm Hook

```tsx
import { useModalWithForm } from '@/hooks/use-advanced-modal'

interface FormData {
  name: string
  email: string
  message: string
}

function FormModalExample() {
  const {
    isOpen,
    openModal,
    closeModalAndReset,
    formData,
    updateFormData,
    errors,
    setFormError,
    isSubmitting,
    setIsSubmitting
  } = useModalWithForm<FormData>({
    name: '',
    email: '',
    message: ''
  })

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    
    try {
      // API call
      await submitForm(formData)
      closeModalAndReset()
    } catch (error) {
      setFormError('name', 'Xatolik yuz berdi')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <>
      <button onClick={openModal}>
        Form Modal
      </button>
      
      <CustomModal
        isOpen={isOpen}
        onClose={closeModalAndReset}
        title="Form"
      >
        <form onSubmit={handleSubmit}>
          <input
            value={formData.name}
            onChange={(e) => updateFormData('name', e.target.value)}
          />
          {errors.name && <span className="text-red-500">{errors.name}</span>}
          
          <button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saqlanmoqda...' : 'Saqlash'}
          </button>
        </form>
      </CustomModal>
    </>
  )
}
```

### 3. useWizardModal Hook (Ko'p bosqichli modal)

```tsx
import { useWizardModal } from '@/hooks/use-advanced-modal'

const steps = ['personal', 'contact', 'review'] as const

function WizardModalExample() {
  const {
    isOpen,
    openModal,
    closeModal,
    currentStep,
    currentStepIndex,
    isFirstStep,
    isLastStep,
    nextStep,
    previousStep,
    stepData,
    updateStepData
  } = useWizardModal(steps)

  return (
    <>
      <button onClick={openModal}>
        Wizard Modal
      </button>
      
      <CustomModal
        isOpen={isOpen}
        onClose={closeModal}
        title={`Bosqich ${currentStepIndex + 1} / ${steps.length}`}
        size="lg"
        footer={
          <div className="flex justify-between w-full">
            <Button 
              onClick={previousStep} 
              disabled={isFirstStep}
              variant="outline"
            >
              Orqaga
            </Button>
            <Button 
              onClick={nextStep} 
              disabled={isLastStep}
            >
              {isLastStep ? 'Yakunlash' : 'Keyingisi'}
            </Button>
          </div>
        }
      >
        {/* Step content */}
        {currentStep === 'personal' && (
          <div>Shaxsiy ma'lumotlar bosqichi</div>
        )}
        {currentStep === 'contact' && (
          <div>Aloqa ma'lumotlari bosqichi</div>
        )}
        {currentStep === 'review' && (
          <div>Ko'rib chiqish bosqichi</div>
        )}
      </CustomModal>
    </>
  )
}
```

## Global Modal Management

### ModalProvider ishlatish

```tsx
// app/layout.tsx yoki root component
import { ModalProvider } from '@/components/providers/modal-provider'

function RootLayout({ children }) {
  return (
    <ModalProvider>
      {children}
    </ModalProvider>
  )
}
```

### Global modal hook

```tsx
import { useGlobalModal } from '@/components/providers/modal-provider'

function Component1() {
  const modal = useGlobalModal('user-details')

  return (
    <button onClick={() => modal.openModal({ userId: 123 })}>
      Foydalanuvchi Ma'lumotlari
    </button>
  )
}

function Component2() {
  const modal = useGlobalModal('user-details')

  return (
    <CustomModal
      isOpen={modal.isOpen}
      onClose={modal.closeModal}
      title="Foydalanuvchi"
    >
      <p>User ID: {modal.props.userId}</p>
    </CustomModal>
  )
}
```

## Modal Parametrlari

### CustomModal Props

| Parametr | Turi | Default | Tavsif |
|----------|------|---------|---------|
| `isOpen` | `boolean` | - | Modal ochiq yoki yopiq |
| `onClose` | `() => void` | - | Modal yopilganda chaqiriladigan funksiya |
| `title` | `string` | - | Modal sarlavhasi |
| `description` | `string` | - | Modal tavsifi |
| `size` | `"sm" \| "md" \| "lg" \| "xl" \| "full"` | `"md"` | Modal o'lchami |
| `showCloseButton` | `boolean` | `true` | Yopish tugmasini ko'rsatish |
| `closeOnOverlayClick` | `boolean` | `true` | Overlay bosilganda yopish |
| `className` | `string` | - | Qo'shimcha CSS class |
| `footer` | `ReactNode` | - | Modal pastki qismi |
| `children` | `ReactNode` | - | Modal kontenti |

### Modal O'lchamlari

- `sm`: 384px maksimal kenglik
- `md`: 448px maksimal kenglik  
- `lg`: 512px maksimal kenglik
- `xl`: 576px maksimal kenglik
- `full`: 95vw maksimal kenglik

## Styling

Modal componentlari Tailwind CSS va shadcn/ui design tizimi asosida yaratilgan. Custom styling uchun:

```tsx
<CustomModal
  className="max-w-2xl"
  headerClassName="bg-primary text-white"
  contentClassName="p-8"
  footerClassName="bg-muted"
  isOpen={isOpen}
  onClose={onClose}
>
  {/* content */}
</CustomModal>
```

## Accessibility

Barcha modal componentlari quyidagi accessibility xususiyatlarini qo'llab-quvvatlaydi:

- **Keyboard Navigation**: Tab, Shift+Tab, Escape tugmalari
- **Focus Management**: Modal ochilganda va yopilganda fokus boshqaruvi
- **Screen Reader**: ARIA labellar va rollar
- **Focus Trap**: Modal ichida fokusni saqlash

## TypeScript Support

Barcha componentlar to'liq TypeScript qo'llab-quvvatlaydi:

```tsx
import type { CustomModalProps, ModalState } from '@/types/modal'

interface MyModalProps extends CustomModalProps {
  data: MyDataType
}

const MyModal: React.FC<MyModalProps> = ({ data, ...props }) => {
  return <CustomModal {...props}>{/* content */}</CustomModal>
}
```

## Performance Tips

1. **Lazy Loading**: Katta modal contentini lazy load qiling
2. **Memoization**: React.memo ishlatib componentlarni optimize qiling
3. **State Management**: Ko'p modal uchun global state ishlatang

```tsx
const LazyModalContent = React.lazy(() => import('./ModalContent'))

<CustomModal isOpen={isOpen} onClose={onClose}>
  <React.Suspense fallback={<div>Yuklanmoqda...</div>}>
    <LazyModalContent />
  </React.Suspense>
</CustomModal>
```

## Misollar

To'liq ishlaydigan misollar uchun `components/examples/modal-examples.tsx` faylini ko'ring.

## Xatolarni Tuzatish

### Umumiy muammolar:

1. **Modal ochilmayapti**: `isOpen` state to'g'ri o'rnatilganligini tekshiring
2. **Focus muammolari**: `autoFocus` va `restoreFocus` parametrlarini tekshiring
3. **Styling muammolari**: Tailwind CSS class nomlari to'g'riligini tekshiring
4. **TypeScript xatolari**: Type definitionlar import qilinganligini tekshiring

### Debug qilish:

```tsx
<CustomModal
  isOpen={isOpen}
  onClose={() => {
    console.log('Modal yopilmoqda')
    onClose()
  }}
  // ... other props
>
  {/* content */}
</CustomModal>
```

## Yangilanishlar

- **v1.0.0**: Asosiy modal componentlari
- **v1.1.0**: Advanced hooks qo'shildi
- **v1.2.0**: Wizard modal va global management
- **v1.3.0**: Performance optimizationslar

---

Bu componentlar loyihangizda modal oynalar yaratish uchun to'liq yechimni taqdim etadi. Qo'shimcha savollar yoki xususiyatlar kerak bo'lsa, dokumentatsiyani yangilash mumkin.