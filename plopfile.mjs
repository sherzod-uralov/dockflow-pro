export default function (plop) {
  plop.setGenerator("feature", {
    description: "Yangi feature yaratish",
    prompts: [
      {
        type: "input",
        name: "name",
        message:
          "Feature nomini kiriting (masalan: permission yoki department):",
      },
      {
        type: "input",
        name: "api",
        message:
          "API endpoint root nomi (masalan: /permission yoki /department):",
      },
      {
        type: "input",
        name: "resourceName",
        message:
          "Error handler uchun resurs nomi (masalan: Permission yoki Department):",
      },
    ],
    actions: [
      // 1) features papkasiga qo‘shish
      {
        type: "addMany",
        base: "plop-templates/feature",
        templateFiles: "plop-templates/feature/**/*",
        destination: "features/{{dashCase name}}",
      },

      // 2) endpoints.ts ga CRUD qo‘shish
      {
        type: "modify",
        path: "api/axios.endpoints.ts",
        pattern: /(export const endpoints = {[\s\S]*?)/,
        template: `$1
  {{camelCase name}}: {
    list: "{{api}}",
    create: "{{api}}",
    detail: (id: string | number) => \`{{api}}/\${id}\`,
    update: (id: string | number) => \`{{api}}/\${id}\`,
    delete: (id: string | number) => \`{{api}}/\${id}\`,
  },`,
      },

      // 3) errorHandlers ga qo‘shish
      {
        type: "modify",
        path: "utils/http-error-handler.ts",
        pattern: /(export const errorHandlers = {[\s\S]*?)(};)/,
        template: `$1  {{camelCase name}}: createErrorHandler("{{properCase name}}"),\n$2`,
      },
      {
        type: "modify",
        path: "utils/http-error-handler.ts",
        pattern: /(export const {[\s\S]*?)(} = errorHandlers;)/,
        template: `$1  {{camelCase name}}: handle{{properCase name}}Error,\n$2`,
      },

      // 4) app/dashboard/admin ichida sahifa yaratish
      {
        type: "add",
        path: "app/dashboard/{{dashCase name}}/page.tsx",
        template: `import {{properCase name}}Page from "@/features/{{dashCase name}}/page/{{dashCase name}}.page";
import { Home } from "lucide-react";
import { PageHeader } from "@/components/shared/ui/custom-breadcrumb";

const Page = () => {
  return (
    <>
      <PageHeader
        title="{{properCase resourceName}}"
        description="{{properCase resourceName}}larni boshqarish"
        items={[
          {
            label: "Bosh sahifa",
            href: "/dashboard",
            icon: <Home size={16} />,
          },
          {
            label: "Admin",
            href: "/dashboard/admin",
          },
          {
            label: "{{properCase resourceName}}",
            href: "/dashboard/admin/{{dashCase name}}",
          },
        ]}
      />
      <{{properCase name}}Page />
    </>
  );
};

export default Page;
`,
      },
    ],
  });
}
