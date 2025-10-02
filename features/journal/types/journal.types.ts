// features/journal/types/journal.types.ts

import { ModalState } from "@/types/modal";
import { DataPagination } from "@/types/global.types";

// 1. Тип для ОДНОГО журнала, как он приходит из API (с вложенными объектами)
export type SingleJournalApiResponse = {
  id: string;
  name: string;
  prefix: string;
  format: string;
  department: {
    id: string;
    name: string;
  };
  responsibleUser: {
    id: string;
    fullname: string;
    username: string;
  };
};

// 2. Тип для ВСЕГО ответа API (список + пагинация)
export interface JournalListResponse extends DataPagination {
  id: string;
  data: SingleJournalApiResponse[];
}

// 3. Тип для данных, которые ожидает форма ("плоская" структура)
export type JournalFormData = {
  id: string;
  name: string;
  prefix: string;
  format: string;
  departmentId: string;
  responsibleUserId: string;
};

// 4. Пропсы для компонента формы
export type JournalFormProps = {
  modal: ModalState;
  mode: "create" | "edit";

  // Форма должна принимать данные в том виде, в котором они приходят из API
  journal?: SingleJournalApiResponse;
};
