import CmsFormEditor from "@/components/admin/cms-form-editor";
import { createAdminMetadata } from "@/lib/admin/metadata";

export const metadata = createAdminMetadata("Create Form", "Add a new form.");

export default function CreateFormPage() {
  return <CmsFormEditor mode="create" />;
}
